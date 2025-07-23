import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerType, SalesStatus } from '@prisma/client';

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: SalesStatus;
}

@Injectable()
export class CsvExportService {
  private readonly logger = new Logger(CsvExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportSalesToCsv(filters: ExportFilters): Promise<string> {
    try {
      this.logger.log('Starting MongoDB aggregation export', { filters });

      // Build aggregation pipeline for MongoDB 
      const pipeline = this.buildAggregationPipeline(filters);

      // Use aggregateRaw for complex joins and transformations
      const results = await this.prisma.sales.aggregateRaw({
        pipeline,
      });

      // Handle MongoDB aggregation result - it's a JsonObject that contains an array
      const resultsArray = Array.isArray(results)
        ? results
        : (results as any)?.result || Object.values(results)[0] || [];

      this.logger.log(
        `MongoDB aggregation returned ${resultsArray.length} records`,
      );

      return this.convertAggregationResultsToCsv(resultsArray as any[]);
    } catch (error) {
      this.logger.error('MongoDB aggregation export failed', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Alternative approach using findRaw with multiple queries
  async exportSalesToCsvWithFindRaw(filters: ExportFilters): Promise<string> {
    try {
      this.logger.log('Starting MongoDB findRaw export', { filters });

      // Build MongoDB filter
      const mongoFilter = this.buildMongoFilter(filters);

      // Get sales data using findRaw
      const salesResult = await this.prisma.sales.findRaw({
        filter: mongoFilter,
        options: {
          sort: { createdAt: -1 },
        },
      });

      // Handle MongoDB findRaw result
      const salesData = Array.isArray(salesResult)
        ? salesResult
        : (salesResult as any)?.result || Object.values(salesResult)[0] || [];

      this.logger.log(`Found ${salesData.length} sales records`);

      // Process each sale and get related data
      const enrichedData = await this.enrichSalesData(salesData as any[]);

      return this.convertEnrichedDataToCsv(enrichedData);
    } catch (error) {
      this.logger.error('MongoDB findRaw export failed', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Optimized approach using aggregation pipeline
  private buildAggregationPipeline(filters: ExportFilters): any[] {
    const pipeline: any[] = [];

    // Match stage for filtering
    const matchStage: any = {};

    if (filters.startDate || filters.endDate) {
      if (filters.startDate && filters.endDate) {
        matchStage.$or = [
          {
            transactionDate: {
              $ne: null,
              $gte: { $date: filters.startDate.toISOString() },
              $lte: { $date: filters.endDate.toISOString() },
            },
          },
          {
            transactionDate: null,
            createdAt: {
              $gte: { $date: filters.startDate.toISOString() },
              $lte: { $date: filters.endDate.toISOString() },
            },
          },
        ];
      }
    }

    if (filters.status) {
      matchStage.status = filters.status;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      // Join with customers
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $addFields: {
          customer: { $arrayElemAt: ['$customer', 0] },
        },
      },

      // Join with sale items
      {
        $lookup: {
          from: 'sales_items',
          localField: '_id',
          foreignField: 'saleId',
          as: 'saleItems',
        },
      },

      // Unwind sale items to process each item separately
      {
        $unwind: {
          path: '$saleItems',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Join with products
      {
        $lookup: {
          from: 'products',
          localField: 'saleItems.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ['$product', 0] },
        },
      },

      // Join with devices
      {
        $lookup: {
          from: 'devices',
          localField: 'saleItems.deviceIDs',
          foreignField: '_id',
          as: 'devices',
        },
      },

      // Join with batch allocations
      {
        $lookup: {
          from: 'batch_allocations',
          localField: '_id',
          foreignField: 'saleId',
          as: 'batchAllocations',
        },
      },

      {
        $addFields: {
          batchAllocationInventory: {
            $let: {
              vars: {
                batchAlloc: { $arrayElemAt: ['$batchAllocations', 0] },
              },
              in: '$$batchAlloc.inventoryBatchId',
            },
          },
        },
      },

      // Lookup inventory batch from batch allocation
      {
        $lookup: {
          from: 'inventory_batches',
          localField: 'batchAllocationInventory',
          foreignField: '_id',
          as: 'batchAllocationInventoryBatch',
        },
      },

      // Lookup product inventories for fallback
      {
        $lookup: {
          from: 'ProductInventory',
          localField: 'product._id',
          foreignField: 'productId',
          as: 'productInventories',
        },
      },

      // Lookup inventory details
      {
        $lookup: {
          from: 'inventories',
          localField: 'productInventories.inventoryId',
          foreignField: '_id',
          as: 'inventoryDetails',
        },
      },

      // Lookup inventory batches for fallback
      {
        $lookup: {
          from: 'inventory_batches',
          localField: 'inventoryDetails._id',
          foreignField: 'inventoryId',
          as: 'fallbackInventoryBatches',
        },
      },

      // Choose between batch allocation inventory or fallback
      {
        $addFields: {
          finalInventoryBatch: {
            $cond: {
              if: { $gt: [{ $size: '$batchAllocationInventoryBatch' }, 0] },
              then: { $arrayElemAt: ['$batchAllocationInventoryBatch', 0] },
              else: { $arrayElemAt: ['$fallbackInventoryBatches', 0] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          transactionDate: 1,
          createdAt: 1,
          status: 1,
          serialNumber: { $arrayElemAt: ['$devices.serialNumber', 0] },
          customerId: '$customer._id',
          customerName: '$customer.fullname',
          gender: '$customer.gender',
          customerCategory: '$customer.customerCategory',
          customerType: '$customer.type',
          location: '$customer.location',
          state: '$customer.state',
          lga: '$customer.lga',
          phone: '$customer.phone',
          alternatePhone: '$customer.alternatePhone',
          latitude: '$customer.latitude',
          longitude: '$customer.longitude',
          productName: '$product.name',
          pvCapacity: '$product.pvCapacity',
          paymentMode: '$saleItems.paymentMode',
          quantity: '$saleItems.quantity',
          installmentStartingPrice: '$saleItems.installmentStartingPrice',
          monthlyPayment: '$saleItems.monthlyPayment',
          retailCost: {
            $ifNull: ['$finalInventoryBatch.costOfItem', 0],
          },
          costToUser: {
            $ifNull: ['$finalInventoryBatch.price', 0],
          },
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    );

    return pipeline;
  }

  private buildMongoFilter(filters: ExportFilters): any {
    const mongoFilter: any = {};

    if (filters.startDate || filters.endDate) {
      if (filters.startDate && filters.endDate) {
        mongoFilter.$or = [
          {
            transactionDate: {
              $ne: null,
              $gte: { $date: filters.startDate.toISOString() },
              $lte: { $date: filters.endDate.toISOString() },
            },
          },
          {
            transactionDate: null,
            createdAt: {
              $gte: { $date: filters.startDate.toISOString() },
              $lte: { $date: filters.endDate.toISOString() },
            },
          },
        ];
      }
    }

    if (filters.status) {
      mongoFilter.status = filters.status;
    }

    return mongoFilter;
  }

  private async enrichSalesData(salesData: any[]): Promise<any[]> {
    const enrichedData = [];

    for (const sale of salesData) {
      try {
        // Get customer data
        const customerResult = await this.prisma.customer.findRaw({
          filter: { _id: { $oid: sale.customerId } },
        });
        const customerArray = Array.isArray(customerResult)
          ? customerResult
          : (customerResult as any)?.result ||
            Object.values(customerResult)[0] ||
            [];
        const customer = customerArray[0];

        // Get sale items
        const saleItemsResult = await this.prisma.saleItem.findRaw({
          filter: { saleId: { $oid: sale._id } },
        });
        const saleItemsData = Array.isArray(saleItemsResult)
          ? saleItemsResult
          : (saleItemsResult as any)?.result ||
            Object.values(saleItemsResult)[0] ||
            [];

        for (const saleItem of saleItemsData as any[]) {
          // Get product data
          const productResult = await this.prisma.product.findRaw({
            filter: { _id: { $oid: saleItem.productId } },
          });
          const productArray = Array.isArray(productResult)
            ? productResult
            : (productResult as any)?.result ||
              Object.values(productResult)[0] ||
              [];
          const product = productArray[0];

          // Get devices
          const devicesResult = await this.prisma.device.findRaw({
            filter: { saleItemId: { $oid: saleItem._id } },
          });
          const devicesData = Array.isArray(devicesResult)
            ? devicesResult
            : (devicesResult as any)?.result ||
              Object.values(devicesResult)[0] ||
              [];

          // Get batch allocations
          const batchAllocationsResult =
            await this.prisma.batchAlocation.findRaw({
              filter: { saleId: { $oid: sale._id } },
            });
          const batchAllocationsData = Array.isArray(batchAllocationsResult)
            ? batchAllocationsResult
            : (batchAllocationsResult as any)?.result ||
              Object.values(batchAllocationsResult)[0] ||
              [];

          let inventoryBatch = null;
          if ((batchAllocationsData as any[]).length > 0) {
            const batchAllocation = (batchAllocationsData as any[])[0];
            const inventoryBatchResult =
              await this.prisma.inventoryBatch.findRaw({
                filter: { _id: { $oid: batchAllocation.inventoryBatchId } },
              });
            const inventoryBatchArray = Array.isArray(inventoryBatchResult)
              ? inventoryBatchResult
              : (inventoryBatchResult as any)?.result ||
                Object.values(inventoryBatchResult)[0] ||
                [];
            inventoryBatch = inventoryBatchArray[0];
          }

          enrichedData.push({
            sale,
            customer,
            saleItem,
            product,
            devices: devicesData as any[],
            inventoryBatch,
          });
        }
      } catch (error) {
        this.logger.warn(`Error enriching sale ${sale._id}:`, error);
        continue;
      }
    }

    return enrichedData;
  }

  private convertAggregationResultsToCsv(results: any[]): string {
    const headers = this.getCSVHeaders();
    const csvRows = [headers.join(',')];

    for (const row of results) {
      const csvRow = [
        this.escapeCSVValue(row.serialNumber || ''),
        this.escapeCSVValue(this.extractObjectId(row.customerId) || ''),
        this.escapeCSVValue(row.customerName || ''),
        this.escapeCSVValue(row.gender || ''),
        this.escapeCSVValue(row.customerCategory || ''),
        this.escapeCSVValue(this.mapCustomerTypeToDisplay(row.customerType)),
        this.escapeCSVValue(row.location || ''),
        this.escapeCSVValue(row.state || ''),
        this.escapeCSVValue(row.lga || ''),
        this.escapeCSVValue(row.phone || ''),
        this.escapeCSVValue(row.alternatePhone || ''),
        this.escapeCSVValue(row.latitude?.toString() || ''),
        this.escapeCSVValue(row.longitude?.toString() || ''),
        this.escapeCSVValue(
          this.formatDateToDDMMYYYY(row.transactionDate || row.createdAt),
        ),
        this.escapeCSVValue(row.productName || ''),
        this.escapeCSVValue(row.pvCapacity?.toString() || ''),
        this.escapeCSVValue(this.mapPaymentModeToDisplay(row.paymentMode)),
        this.escapeCSVValue(row.retailCost?.toString() || '0'),
        this.escapeCSVValue(row.costToUser?.toString() || '0'),
        this.escapeCSVValue(
          row.paymentMode === 'INSTALLMENT' ? 'Installment' : 'N/A(Outright)',
        ),
        this.escapeCSVValue(row.installmentStartingPrice?.toString() || '0'),
        this.escapeCSVValue(row.monthlyPayment?.toString() || '0'),
        this.escapeCSVValue(row.quantity?.toString() || '1'),
      ];

      csvRows.push(csvRow.join(','));
    }

    return csvRows.join('\n');
  }

  private convertEnrichedDataToCsv(enrichedData: any[]): string {
    const headers = this.getCSVHeaders();
    const csvRows = [headers.join(',')];

    for (const item of enrichedData) {
      const { sale, customer, saleItem, product, devices, inventoryBatch } =
        item;

      const csvRow = [
        this.escapeCSVValue(devices[0]?.serialNumber || ''),
        this.escapeCSVValue(customer?._id?.toString() || ''),
        this.escapeCSVValue(customer?.fullname || ''),
        this.escapeCSVValue(customer?.gender || ''),
        this.escapeCSVValue(customer?.customerCategory || ''),
        this.escapeCSVValue(this.mapCustomerTypeToDisplay(customer?.type)),
        this.escapeCSVValue(customer?.location || ''),
        this.escapeCSVValue(customer?.state || ''),
        this.escapeCSVValue(customer?.lga || ''),
        this.escapeCSVValue(customer?.phone || ''),
        this.escapeCSVValue(customer?.alternatePhone || ''),
        this.escapeCSVValue(customer?.latitude?.toString() || ''),
        this.escapeCSVValue(customer?.longitude?.toString() || ''),
        this.escapeCSVValue(
          this.formatDateToDDMMYYYY(sale?.transactionDate || sale?.createdAt),
        ),
        this.escapeCSVValue(product?.name || ''),
        this.escapeCSVValue(product?.pvCapacity?.toString() || ''),
        this.escapeCSVValue(
          this.mapPaymentModeToDisplay(saleItem?.paymentMode),
        ),
        this.escapeCSVValue(inventoryBatch?.costOfItem?.toString() || '0'),
        this.escapeCSVValue(inventoryBatch?.price?.toString() || '0'),
        this.escapeCSVValue(
          saleItem?.paymentMode === 'INSTALLMENT'
            ? 'Installment'
            : 'N/A(Outright)',
        ),
        this.escapeCSVValue(
          saleItem?.installmentStartingPrice?.toString() || '0',
        ),
        this.escapeCSVValue(saleItem?.monthlyPayment?.toString() || '0'),
        this.escapeCSVValue(saleItem?.quantity?.toString() || '1'),
      ];

      csvRows.push(csvRow.join(','));
    }

    return csvRows.join('\n');
  }

  // Paginated export for large datasets
  async exportSalesToCsvPaginated(filters: ExportFilters): Promise<string> {
    try {
      this.logger.log('Starting paginated MongoDB export', { filters });

      const pageSize = 1000;
      let skip = 0;
      let hasMore = true;
      const allCsvRows: string[] = [];

      // Add headers only once
      const headers = this.getCSVHeaders();
      allCsvRows.push(headers.join(','));

      while (hasMore) {
        this.logger.log(`Fetching page: skip=${skip}, limit=${pageSize}`);

        const pipeline = this.buildAggregationPipeline(filters);

        // Add pagination
        pipeline.push({ $skip: skip }, { $limit: pageSize });

        const results = await this.prisma.sales.aggregateRaw({
          pipeline,
        });

        // Handle MongoDB aggregation result
        const pageResults = Array.isArray(results)
          ? results
          : (results as any)?.result || Object.values(results)[0] || [];

        if (pageResults.length === 0) {
          hasMore = false;
          break;
        }

        // Convert page results to CSV rows (without headers)
        for (const row of pageResults) {
          const csvRow = [
            this.escapeCSVValue(row.serialNumber || ''),
            this.escapeCSVValue(this.extractObjectId(row.customerId) || ''),
            this.escapeCSVValue(row.customerName || ''),
            this.escapeCSVValue(row.gender || ''),
            this.escapeCSVValue(row.customerCategory || ''),
            this.escapeCSVValue(
              this.mapCustomerTypeToDisplay(row.customerType),
            ),
            this.escapeCSVValue(row.location || ''),
            this.escapeCSVValue(row.state || ''),
            this.escapeCSVValue(row.lga || ''),
            this.escapeCSVValue(row.phone || ''),
            this.escapeCSVValue(row.alternatePhone || ''),
            this.escapeCSVValue(row.latitude?.toString() || ''),
            this.escapeCSVValue(row.longitude?.toString() || ''),
            this.escapeCSVValue(
              this.formatDateToDDMMYYYY(row.transactionDate || row.createdAt),
            ),
            this.escapeCSVValue(row.productName || ''),
            this.escapeCSVValue(row.pvCapacity?.toString() || ''),
            this.escapeCSVValue(this.mapPaymentModeToDisplay(row.paymentMode)),
            this.escapeCSVValue(row.retailCost?.toString() || '0'),
            this.escapeCSVValue(row.costToUser?.toString() || '0'),
            this.escapeCSVValue(
              row.paymentMode === 'INSTALLMENT'
                ? 'Installment'
                : 'N/A(Outright)',
            ),
            this.escapeCSVValue(
              row.installmentStartingPrice?.toString() || '0',
            ),
            this.escapeCSVValue(row.monthlyPayment?.toString() || '0'),
            this.escapeCSVValue(row.quantity?.toString() || '1'),
          ];

          allCsvRows.push(csvRow.join(','));
        }

        skip += pageSize;
        hasMore = pageResults.length === pageSize;

        // Add small delay to prevent overwhelming MongoDB
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.logger.log(`Export completed. Total rows: ${allCsvRows.length - 1}`);
      return allCsvRows.join('\n');
    } catch (error) {
      this.logger.error('Paginated MongoDB export failed', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  private extractObjectId(id: any): string {
    if (!id) return '';

    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid) return id.$oid;
    if (typeof id === 'object' && id._bsontype === 'ObjectID')
      return id.toString();

    return String(id);
  }

  // Estimate document count for large collections
  async estimateRecordCount(filters: ExportFilters): Promise<number> {
    try {
      if (Object.keys(filters).length === 0) {
        // Use estimatedDocumentCount for better performance on large collections
        const result = await this.prisma.$runCommandRaw({
          collStats: 'sales',
        });
        return (result as any).count || 0;
      } else {
        // Use count with filters
        const mongoFilter = this.buildMongoFilter(filters);
        const result = await this.prisma.$runCommandRaw({
          count: 'sales',
          query: mongoFilter,
        });
        return (result as any).n || 0;
      }
    } catch (error) {
      this.logger.warn('Failed to estimate count, using fallback', error);
      // Fallback to aggregation count
      const pipeline = this.buildAggregationPipeline(filters);
      pipeline.push({ $count: 'total' });

      const result = await this.prisma.sales.aggregateRaw({ pipeline });
      const resultArray = Array.isArray(result)
        ? result
        : (result as any)?.result || Object.values(result)[0] || [];
      return resultArray[0]?.total || 0;
    }
  }

  private getCSVHeaders(): string[] {
    return [
      'External ID (Serial No)',
      'Customer ID',
      'Customer Name',
      'Gender of Primary Account Holder',
      'Customer Category',
      'Customer Type',
      'Location (Address)',
      'Location (State)',
      'Location (LGA)',
      'Phone Number',
      'Alternate phone number',
      'Latitude',
      'Longitude',
      'Payment Date',
      'Model',
      'PV Capacity (W)',
      'Type of Payment',
      'Retail Cost of System (NGN)',
      'Cost to End User (N)',
      'Payment Plan',
      'Downpayment Amount (NGN)',
      'Installment Amount (NGN)',
      'Quantity',
    ];
  }

  private mapCustomerTypeToDisplay(type: string): string {
    if (!type) return '';

    switch (type) {
      case CustomerType.Commercial_Retailer:
        return 'Commercial - Retailer';
      default:
        return type;
    }
  }

  private formatDateToDDMMYYYY(date: any): string {
    if (!date) return '';

    try {
      const dateObj = date.$date ? new Date(date.$date) : new Date(date);

      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      this.logger.warn('Error formatting date', { date, error: error.message });
      return '';
    }
  }

  private mapPaymentModeToDisplay(paymentMode: string): string {
    if (!paymentMode) return 'Outright';

    switch (paymentMode) {
      case 'ONE_OFF':
        return 'Outright';
      case 'INSTALLMENT':
        return 'Installment';
      default:
        return 'Outright';
    }
  }

  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }
}
