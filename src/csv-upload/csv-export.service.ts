import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SalesStatus } from '@prisma/client';

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
              product: true,
              devices: true,
            },
          },
          payment: {
            orderBy: {
              createdAt: 'desc',
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

  private convertSalesDataToCsv(salesData: any[]): string {
    // Define CSV headers - matching upload format
    const headers = [
      'CUSTOMER_NAME',
      'contractNumber',
      'ADDRESS_LINE',
      'MOBILE_NUMBER',
      'LOAN_AMOUNT',
      'contract DATE',
      'PRODUCT',
      'PRODUCT SERIAL NUMBER',
      'numberOfUnits',
      'client.profile.gps.latitude',
      'client.profile.gps.longitude',
      'client.profile.gender',
      'transactionId',
      'amount',
      'reference',
      'date',
    ];

    // Start with headers
    const csvRows = [headers.join(',')];

    // Process each sale
    for (const sale of salesData) {
      const customer = sale.customer;
      const contract = sale.contract;
      const saleItems = sale.saleItems || [];
      const payments = sale.payment || [];

      // For each sale item, create a row (or multiple rows if multiple items)
      if (saleItems.length > 0) {
        for (const item of saleItems) {
          const product = item.product;
          const devices = item.devices || [];
          const serialNumber =
            devices.length > 0 ? devices[0].serialNumber : '';

          // Get the most recent payment for transaction details
          const recentPayment = payments.length > 0 ? payments[0] : null;

          const row = [
            this.escapeCSVValue(
              `${customer?.firstname || ''} ${customer?.lastname || ''}`.trim(),
            ),
            this.escapeCSVValue(contract?.id || ''),
            this.escapeCSVValue(customer?.location || ''),
            this.escapeCSVValue(customer?.phone || ''),
            this.escapeCSVValue(sale.totalPrice?.toString() || '0'),
            this.escapeCSVValue(
              contract?.signedAt ? this.formatDate(contract.signedAt) : '',
            ),
            this.escapeCSVValue(product?.name || ''),
            this.escapeCSVValue(serialNumber),
            this.escapeCSVValue(item.quantity?.toString() || '1'),
            this.escapeCSVValue(customer?.latitude || ''),
            this.escapeCSVValue(customer?.longitude || ''),
            this.escapeCSVValue(this.extractGender(customer) || ''),
            this.escapeCSVValue(recentPayment?.id || ''),
            this.escapeCSVValue(recentPayment?.amount?.toString() || ''),
            this.escapeCSVValue(recentPayment?.transactionRef || ''),
            this.escapeCSVValue(
              recentPayment?.paymentDate
                ? this.formatDate(recentPayment.paymentDate)
                : '',
            ),
          ];

          csvRows.push(row.join(','));
        }
      } else {
        // Handle sales without items
        const recentPayment = payments.length > 0 ? payments[0] : null;

        const row = [
          this.escapeCSVValue(
            `${customer?.firstname || ''} ${customer?.lastname || ''}`.trim(),
          ),
          this.escapeCSVValue(contract?.id || ''),
          this.escapeCSVValue(customer?.location || ''),
          this.escapeCSVValue(customer?.phone || ''),
          this.escapeCSVValue(sale.totalPrice?.toString() || '0'),
          this.escapeCSVValue(
            contract?.signedAt ? this.formatDate(contract.signedAt) : '',
          ),
          this.escapeCSVValue(''),
          this.escapeCSVValue(''),
          this.escapeCSVValue('1'),
          this.escapeCSVValue(customer?.latitude || ''),
          this.escapeCSVValue(customer?.longitude || ''),
          this.escapeCSVValue(this.extractGender(customer) || ''),
          this.escapeCSVValue(recentPayment?.transactionRef || ''),
          this.escapeCSVValue(recentPayment?.amount?.toString() || ''),
          this.escapeCSVValue(recentPayment?.transactionRef || ''),
          this.escapeCSVValue(
            recentPayment?.paymentDate
              ? this.formatDate(recentPayment.paymentDate)
              : '',
          ),
        ];

        csvRows.push(row.join(','));
      }
    }

    return csvRows.join('\n');
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
