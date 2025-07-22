import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BatchAlocation,
  Contract,
  Customer,
  CustomerType,
  Device,
  InventoryBatch,
  Payment,
  Prisma,
  Product,
  SaleItem,
  Sales,
  SalesStatus,
} from '@prisma/client';

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
      this.logger.log('Starting sales data export', { filters });

      // Build query filters
      const whereClause: Prisma.SalesWhereInput = {};

      if (filters.startDate || filters.endDate) {
        whereClause.OR = [
          // Use transactionDate if available and not null
          {
            transactionDate: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
              not: null,
            },
          },
          // Fallback to createdAt when transactionDate is null
          {
            transactionDate: null,
            createdAt: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          },
        ];
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const salesData = await this.prisma.sales.findMany({
        where: whereClause,
        include: {
          customer: true,
          contract: true,
          saleItems: {
            include: {
              product: {
                include: {
                  inventories: {
                    include: {
                      inventory: {
                        include: {
                          batches: true,
                        },
                      },
                    },
                  },
                },
              },
              devices: true,
            },
          },
          payment: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          batchAllocations: {
            include: {
              inventoryBatch: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`Found ${salesData.length} sales records to export`);

      const csvContent = this.convertSalesDataToCsv(salesData);

      return csvContent;
    } catch (error) {
      this.logger.error('Error exporting sales data', error);
      throw new Error(`Failed to export sales data: ${error.message}`);
    }
  }

  private convertSalesDataToCsv(
    salesData: (Sales & {
      customer: Customer;
      contract?: Contract | null;
      saleItems: (SaleItem & {
        product: Product & {
          inventories: Array<{
            inventory: {
              batches: InventoryBatch[];
            };
          }>;
        };
        devices: Device[];
      })[];
      payment: Payment[];
      batchAllocations: (BatchAlocation & {
        inventoryBatch: InventoryBatch;
      })[];
    })[],
  ): string {
    // Define CSV headers - matching upload format
    const headers = [
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

    // Start with headers
    const csvRows = [headers.join(',')];

    // Process each sale
    for (const sale of salesData) {
      const customer = sale.customer;
      const saleItems = sale.saleItems || [];

      for (const item of saleItems) {
        const product = item.product;
        const devices = item.devices || [];
        const serialNumber = devices.length > 0 ? devices[0].serialNumber : '';

        let inventoryBatch: InventoryBatch | null = null;

        const batchAllocation = sale.batchAllocations?.find(
          (ba) => ba.inventoryBatch,
        );
        inventoryBatch = batchAllocation?.inventoryBatch || null;

        if (!inventoryBatch && product.inventories?.length > 0) {
          const inventory = product.inventories[0]?.inventory;
          if (inventory?.batches?.length > 0) {
            inventoryBatch = inventory.batches[0];
          }
        }

        const row = [
          this.escapeCSVValue(serialNumber),
          this.escapeCSVValue(customer?.id || ''),
          this.escapeCSVValue(customer?.fullname || ''),
          this.escapeCSVValue(customer?.gender || ''),
          this.escapeCSVValue(customer?.customerCategory || ''),
          this.escapeCSVValue(this.mapCustomerTypeToDisplay(customer?.type)),
          this.escapeCSVValue(customer.location),
          this.escapeCSVValue(customer.state),
          this.escapeCSVValue(customer.lga),
          this.escapeCSVValue(customer?.phone || ''),
          this.escapeCSVValue(customer.alternatePhone || ''),
          this.escapeCSVValue(customer?.latitude || ''),
          this.escapeCSVValue(customer?.longitude || ''),
          this.escapeCSVValue(this.formatDateToDDMMYYYY(sale?.transactionDate)),
          this.escapeCSVValue(product?.name || ''),
          this.escapeCSVValue(product?.pvCapacity || ''),
          this.escapeCSVValue(this.mapPaymentModeToDisplay(item.paymentMode)),
          this.escapeCSVValue(inventoryBatch?.costOfItem?.toString() || '0'),
          this.escapeCSVValue(inventoryBatch?.price?.toString() || '0'),
          this.escapeCSVValue(
            item.paymentMode === 'INSTALLMENT'
              ? 'Installment'
              : 'N/A(Outright)',
          ),
          this.escapeCSVValue(item.installmentStartingPrice?.toString() || '0'),
          this.escapeCSVValue(item.monthlyPayment?.toString() || '0'),
          this.escapeCSVValue(item.quantity?.toString() || '1'),
        ];

        csvRows.push(row.join(','));
      }
    }

    return csvRows.join('\n');
  }

  private mapCustomerTypeToDisplay(type: string): string {
    switch (type) {
      case CustomerType.Commercial_Retailer:
        return 'Commercial - Retailer';
      default:
        return type;
    }
  }

  private formatDateToDDMMYYYY(date: Date | null | undefined): string {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private mapPaymentModeToDisplay(paymentMode: string): string {
    switch (paymentMode) {
      case 'ONE_OFF':
        return 'Outright';
      case 'INSTALLMENT':
        return 'Installment';
      default:
        return 'Outright';
    }
  }

  private escapeCSVValue(value: string): string {
    if (!value) return '';

    const stringValue = value.toString();

    // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  private formatDate(date: Date): string {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private extractGender(customer: any): string {
    return customer?.gender || '';
  }
}
