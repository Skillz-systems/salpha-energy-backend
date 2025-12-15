import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DeletionResult {
  model: string;
  recordsDeleted: number;
  examples: any[];
}

@Injectable()
export class DateCorrectionService {
  private readonly logger = new Logger(DateCorrectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async deleteRecordsByMonth(
    month: number,
    year?: number,
  ): Promise<any> {
    // Validate month
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const targetYear = year || new Date().getFullYear();

    // Create date range for the month
    const startDate = new Date(Date.UTC(targetYear, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, month, 0, 23, 59, 59, 999));

    this.logger.log(
      `Starting deletion of records created between ${startDate.toISOString()} and ${endDate.toISOString()}`,
    );

    const results: DeletionResult[] = [];

    // Delete in order of dependencies (child records first, then parents)
    results.push(
      await this.deleteSaleItems(startDate, endDate),
      await this.deletePayments(startDate, endDate),
      await this.deleteSales(startDate, endDate),
      await this.deleteContracts(startDate, endDate),
      await this.deleteOrphanedTransactions(startDate, endDate),
      await this.deleteDevices(startDate, endDate),
    );

    this.logger.log('Record deletion completed');
    return results.filter((r) => r !== null);
  }

  private async deleteSaleItems(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting SaleItem records...');

    const saleItems = await this.prisma.saleItem.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        saleId: true,
      },
    });

    console.log({ ssss: saleItems.length});

    if (saleItems.length === 0) {
      this.logger.log('No SaleItem records found for this month');
      return {
        model: 'SaleItem',
        recordsDeleted: 0,
        examples: [],
      };
    }

    // Get examples before deletion
    const examples = saleItems.slice(0, 3).map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      saleId: item.saleId,
    }));

    // Delete all SaleItems in this month
    const deleteResult = await this.prisma.saleItem.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(`Deleted ${deleteResult.count} SaleItem records`);

    return {
      model: 'SaleItem',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  private async deletePayments(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting Payment records...');

    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        saleId: true,
      },
    });

    if (payments.length === 0) {
      this.logger.log('No Payment records found for this month');
      return {
        model: 'Payment',
        recordsDeleted: 0,
        examples: [],
      };
    }

    const examples = payments.slice(0, 3).map((payment) => ({
      id: payment.id,
      createdAt: payment.createdAt,
      saleId: payment.saleId,
    }));

    const deleteResult = await this.prisma.payment.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(`Deleted ${deleteResult.count} Payment records`);

    return {
      model: 'Payment',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  private async deleteSales(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting Sales records...');

    const sales = await this.prisma.sales.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        customerId: true,
      },
    });

    if (sales.length === 0) {
      this.logger.log('No Sales records found for this month');
      return {
        model: 'Sales',
        recordsDeleted: 0,
        examples: [],
      };
    }

    const examples = sales.slice(0, 3).map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt,
      customerId: sale.customerId,
    }));

    const deleteResult = await this.prisma.sales.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(`Deleted ${deleteResult.count} Sales records`);

    return {
      model: 'Sales',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  private async deleteContracts(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting Contract records...');

    const contracts = await this.prisma.contract.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (contracts.length === 0) {
      this.logger.log('No Contract records found for this month');
      return {
        model: 'Contract',
        recordsDeleted: 0,
        examples: [],
      };
    }

    const examples = contracts.slice(0, 3).map((contract) => ({
      id: contract.id,
      createdAt: contract.createdAt,
    }));

    const deleteResult = await this.prisma.contract.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(`Deleted ${deleteResult.count} Contract records`);

    return {
      model: 'Contract',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  private async deleteOrphanedTransactions(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting OrphanedTransaction records...');

    const transactions = await this.prisma.orphanedTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (transactions.length === 0) {
      this.logger.log('No OrphanedTransaction records found for this month');
      return {
        model: 'OrphanedTransaction',
        recordsDeleted: 0,
        examples: [],
      };
    }

    const examples = transactions.slice(0, 3).map((transaction) => ({
      id: transaction.id,
      createdAt: transaction.createdAt,
    }));

    const deleteResult = await this.prisma.orphanedTransaction.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(
      `Deleted ${deleteResult.count} OrphanedTransaction records`,
    );

    return {
      model: 'OrphanedTransaction',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  private async deleteDevices(
    startDate: Date,
    endDate: Date,
  ): Promise<DeletionResult> {
    this.logger.log('Deleting Device records...');

    const devices = await this.prisma.device.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        serialNumber: true,
      },
    });

    if (devices.length === 0) {
      this.logger.log('No Device records found for this month');
      return {
        model: 'Device',
        recordsDeleted: 0,
        examples: [],
      };
    }

    const examples = devices.slice(0, 3).map((device) => ({
      id: device.id,
      createdAt: device.createdAt,
      serialNumber: device.serialNumber,
    }));

    const deleteResult = await this.prisma.device.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    this.logger.log(`Deleted ${deleteResult.count} Device records`);

    return {
      model: 'Device',
      recordsDeleted: deleteResult.count,
      examples,
    };
  }

  /**
   * Get count of records that would be deleted for a given month
   * (useful for preview before actual deletion)
   */
  async getMonthDeletionPreview(
    month: number,
    year?: number,
  ): Promise<{
    month: number;
    year: number;
    totalRecords: number;
    breakdown: any[];
  }> {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(Date.UTC(targetYear, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, month, 0, 23, 59, 59, 999));

    const breakdown: any[] = [];
    let totalRecords = 0;

    // Count Sales
    const salesCount = await this.prisma.sales.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'Sales', count: salesCount });
    totalRecords += salesCount;

    // Count Payments
    const paymentsCount = await this.prisma.payment.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'Payment', count: paymentsCount });
    totalRecords += paymentsCount;

    // Count Contracts
    const contractsCount = await this.prisma.contract.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'Contract', count: contractsCount });
    totalRecords += contractsCount;

    // Count SaleItems
    const saleItemsCount = await this.prisma.saleItem.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'SaleItem', count: saleItemsCount });
    totalRecords += saleItemsCount;

    // Count Devices
    const devicesCount = await this.prisma.device.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'Device', count: devicesCount });
    totalRecords += devicesCount;

    // Count OrphanedTransactions
    const orphanedCount = await this.prisma.orphanedTransaction.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    breakdown.push({ model: 'OrphanedTransaction', count: orphanedCount });
    totalRecords += orphanedCount;

    return {
      month,
      year: targetYear,
      totalRecords,
      breakdown,
    };
  }
}
