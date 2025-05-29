import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DefaultsGeneratorService } from './defaults-generator.service';
import { SalesCsvRowDto, TransactionsCsvRowDto } from './dto/csv-upload.dto';
import { SalesStatus } from '@prisma/client';

@Injectable()
export class DataMappingService {
  private readonly logger = new Logger(DataMappingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly defaultsGenerator: DefaultsGeneratorService,
  ) {}

  async transformSalesRowToDatabase(
    row: SalesCsvRowDto,
    generatedDefaults: any,
  ) {
    // Generate contextual defaults based on the row data
    const contextualDefaults =
      this.defaultsGenerator.generateContextualDefaults(row, 'sales');

    // Parse and extract data from the row
    const extractedData = this.extractSalesData(row);

    // Create/find related entities
    const product = await this.findOrCreateProduct(
      extractedData.productName,
      generatedDefaults.categories.product.id,
      generatedDefaults.defaultUser.id,
    );

    const { inventory, inventoryBatch } = await this.findOrCreateInventory(
      extractedData.productName,
      extractedData.quantity,
      generatedDefaults.categories.inventory.id,
      extractedData.unitPrice,
      generatedDefaults.defaultUser.id,
    );

    const device = await this.findOrCreateDevice(extractedData.serialNumber);

    // Transform customer data with intelligent defaults
    const customerData = this.transformCustomerData(
      extractedData,
      contextualDefaults,
      generatedDefaults,
    );

    // Transform contract data with generated defaults
    const contractData = this.transformContractData();

    // Create sale item data
    const saleItemData = {
      productId: product.id,
      quantity: extractedData.quantity,
      totalPrice: extractedData.totalPrice,
      paymentMode: this.determinePaymentMode(extractedData.totalPrice),
    };

    // Create sale data
    const saleData = {
      category: 'PRODUCT' as const,
      status: SalesStatus.COMPLETED,
      totalPrice: extractedData.totalPrice,
      totalPaid: extractedData.totalPrice,
      creatorId: generatedDefaults.defaultUser.id,
    };

    return {
      customerData,
      contractData,
      saleData,
      saleItemData,
      relatedEntities: {
        product,
        inventory,
        inventoryBatch,
        device,
        productCreated: product.wasCreated || false,
      },
    };
  }

  private extractSalesData(row: SalesCsvRowDto) {
    // Try multiple field variations for each piece of data
    const customerName = this.extractValue(row, [
      'CUSTOMER_NAME',
      'customer_name',
      'name',
      'client_name',
      'CLIENT_NAME',
    ]);

    const productName = this.extractValue(row, [
      'PRODUCT',
      'product',
      'item',
      'product_name',
      'PRODUCT_NAME',
    ]);

    const serialNumber = this.extractValue(row, [
      'PRODUCT SERIAL NUMBER',
      'product_serial_number',
      'serial',
      'serial_number',
      'SERIAL_NUMBER',
    ]);

    const phoneNumber = this.extractValue(row, [
      'MOBILE_NUMBER',
      'mobile_number',
      'phone',
      'mobile',
      'contact',
    ]);

    const address = this.extractValue(row, [
      'ADDRESS_LINE',
      'address_line',
      'address',
      'location',
    ]);

    const loanAmount = this.parseNumber(
      this.extractValue(row, [
        'LOAN_AMOUNT',
        'loan_amount',
        'amount',
        'total',
        'price',
      ]),
    );

    const contractNumber = this.extractValue(row, [
      'contractNumber',
      'contract_number',
      'contract_id',
      'CONTRACT_NUMBER',
    ]);

    const contractDate = this.parseDate(
      this.extractValue(row, [
        'contract DATE',
        'contract_date',
        'date',
        'CONTRACT_DATE',
      ]),
    );

    const numberOfUnits =
      this.parseNumber(
        this.extractValue(row, [
          'numberOfUnits',
          'number_of_units',
          'units',
          'quantity',
          'qty',
        ]),
      ) || 1;

    const latitude = this.extractValue(row, [
      'client.profile.gps.latitude',
      'latitude',
      'lat',
    ]);

    const longitude = this.extractValue(row, [
      'client.profile.gps.longitude',
      'longitude',
      'lng',
      'long',
    ]);

    const gender = this.extractValue(row, [
      'client.profile.gender',
      'gender',
      'sex',
    ]);

    const totalPrice = loanAmount || 0;
    const unitPrice =
      numberOfUnits > 0 ? totalPrice / numberOfUnits : totalPrice;

    return {
      customerName: customerName || 'Unknown Customer',
      productName: productName || 'Unknown Product',
      serialNumber,
      phoneNumber,
      address,
      totalPrice,
      unitPrice,
      contractNumber,
      contractDate,
      quantity: numberOfUnits,
      latitude,
      longitude,
      gender,
    };
  }

  private transformCustomerData(
    extractedData: any,
    contextualDefaults: any,
    generatedDefaults: any,
  ) {
    const names = this.parseFullName(extractedData.customerName);
    const cleanPhone = this.cleanPhoneNumber(extractedData.phoneNumber);

    return {
      firstname: names.firstname,
      lastname: names.lastname,
      phone: cleanPhone,
      email: this.generateEmail(names.firstname, names.lastname, cleanPhone),
      addressType: 'HOME' as const,
      location: extractedData.address || contextualDefaults.customer.location,
      longitude:
        extractedData.longitude || contextualDefaults.customer.longitude,
      latitude: extractedData.latitude || contextualDefaults.customer.latitude,
      type: 'purchase' as const,
      status: 'active' as const,
      creatorId: generatedDefaults.defaultUser.id,
    };
  }

  private transformContractData() {
    return this.defaultsGenerator.generateContractDefaults();
  }

  async findOrCreateProduct(
    productName: string,
    categoryId: string,
    creatorId: string,
  ) {
    if (
      !productName ||
      productName.trim() === '' ||
      productName === 'Unknown Product'
    ) {
      productName = 'Migrated Product ' + Date.now();
    }

    // Check if product already exists
    let product = await this.prisma.product.findFirst({
      where: {
        name: {
          equals: productName.trim(),
          mode: 'insensitive',
        },
      },
    });

    let wasCreated = false;
    if (!product) {
      const productDefaults = this.defaultsGenerator.generateProductDefaults(
        productName.trim(),
        categoryId,
      );

      product = await this.prisma.product.create({
        data: {
          ...productDefaults,
          creatorId,
        },
      });

      wasCreated = true;
      this.logger.debug(`Created new product: ${productName}`);
    }

    return { ...product, wasCreated };
  }

  async findOrCreateInventory(
    productName: string,
    quantity: number = 1,
    categoryId: string,
    price: number,
    creatorId: string,
  ): Promise<any> {
    // Create or find inventory
    let inventory = await this.prisma.inventory.findFirst({
      where: {
        name: {
          equals: productName.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!inventory) {
      const inventoryDefaults =
        this.defaultsGenerator.generateInventoryDefaults(
          productName.trim(),
          categoryId,
        );

      inventory = await this.prisma.inventory.create({
        data: inventoryDefaults,
      });
    }

    // Create inventory batch
    const batchDefaults = this.defaultsGenerator.generateInventoryBatchDefaults(
      price,
      quantity,
    );
    const batchNumber = await this.getNextBatchNumber(inventory.id);

    const inventoryBatch = await this.prisma.inventoryBatch.create({
      data: {
        ...batchDefaults,
        batchNumber,
        inventoryId: inventory.id,
        creatorId,
      },
    });

    return { inventory, inventoryBatch };
  }

  async findOrCreateDevice(serialNumber: string) {
    if (!serialNumber || serialNumber.trim() === '') {
      return null;
    }

    // Check if device already exists
    let device = await this.prisma.device.findUnique({
      where: { serialNumber: serialNumber.trim() },
    });

    if (!device) {
      const deviceDefaults = this.defaultsGenerator.generateDeviceDefaults(
        serialNumber.trim(),
      );

      device = await this.prisma.device.create({
        data: deviceDefaults,
      });

      this.logger.debug(`Created new device: ${serialNumber}`);
    }

    return device;
  }

  async transformTransactionToPayment(
    row: TransactionsCsvRowDto,
    saleId?: string,
  ) {
    const extractedData = this.extractTransactionData(row);

    return {
      transactionRef: extractedData.reference,
      amount: extractedData.amount,
      paymentStatus: 'COMPLETED' as const,
      paymentDate: extractedData.date,
      saleId: saleId || null,
    };
  }

  extractTransactionData(row: TransactionsCsvRowDto) {
    const transactionId = this.extractValue(row, [
      'transactionId',
      'transaction_id',
      'trans_id',
      'payment_id',
    ]);

    const amount = this.parseNumber(
      this.extractValue(row, ['amount', 'value', 'sum', 'total']),
    );

    const reference =
      this.extractValue(row, [
        'reference',
        'ref',
        'receipt',
        'transaction_ref',
      ]) || transactionId;

    const date = this.parseDate(
      this.extractValue(row, [
        'date',
        'transaction_date',
        'payment_date',
        'timestamp',
      ]),
    );

    return {
      transactionId,
      amount: amount || 0,
      reference: reference || `TXN_${Date.now()}`,
      date: date || new Date(),
    };
  }

  // Business logic methods
  private determinePaymentMode(amount: number): 'ONE_OFF' | 'INSTALLMENT' {
    return amount > 100000 ? 'INSTALLMENT' : 'ONE_OFF';
  }

  private extractValue(row: any, possibleKeys: string[]): string | null {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key].toString().trim();
      }

      // Try case-insensitive match
      const foundKey = Object.keys(row).find(
        (k) => k.toLowerCase() === key.toLowerCase(),
      );
      if (
        foundKey &&
        row[foundKey] !== undefined &&
        row[foundKey] !== null &&
        row[foundKey] !== ''
      ) {
        return row[foundKey].toString().trim();
      }
    }
    return null;
  }

  private parseFullName(fullName: string): {
    firstname: string;
    lastname: string;
  } {
    if (!fullName || fullName.trim() === '') {
      return { firstname: 'Unknown', lastname: 'Customer' };
    }

    const names = fullName
      .trim()
      .split(' ')
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      return { firstname: 'Unknown', lastname: 'Customer' };
    } else if (names.length === 1) {
      return { firstname: names[0], lastname: 'Customer' };
    } else {
      return {
        firstname: names[0],
        lastname: names.slice(1).join(' '),
      };
    }
  }

  private cleanPhoneNumber(phone: string): string {
    if (!phone) return '+234##########';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Handle Nigerian phone numbers
    if (cleaned.startsWith('234')) {
      return cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      return '234' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      return '234' + cleaned;
    }

    return cleaned || this.defaultsGenerator.generateNigerianPhone();
  }

  private generateEmail(
    firstname: string,
    lastname: string,
    phone: string,
  ): string {
    const baseEmail = `${firstname.toLowerCase()}.${lastname.toLowerCase()}`;
    const phoneHash = phone.slice(-4); // Last 4 digits of phone
    const timestamp = Date.now().toString().slice(-4);
    return `${baseEmail}.${phoneHash}.${timestamp}@salphaenergy.com`;
  }

  private parseNumber(value: string | null): number | null {
    if (!value || typeof value !== 'string') return null;

    // Remove currency symbols and commas
    const cleaned = value.replace(/[₦$,\s]/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? null : parsed;
  }

  private parseDate(dateString: string | null): Date | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY format
        const parts = dateString.split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Months are 0-indexed
          const year = parseInt(parts[2]);
          return new Date(year, month, day);
        }
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }

  private async getNextBatchNumber(inventoryId: string): Promise<number> {
    const lastBatch = await this.prisma.inventoryBatch.findFirst({
      where: { inventoryId },
      orderBy: { batchNumber: 'desc' },
    });

    return (lastBatch?.batchNumber || 0) + 1;
  }
}
