import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DefaultsGeneratorService } from './defaults-generator.service';
import { SalesCsvRowDto, TransactionsCsvRowDto } from './dto/csv-upload.dto';
import { CustomerType, PaymentMode, SalesStatus } from '@prisma/client';

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
      extractedData.pvCapacity
    );

    const { inventory, inventoryBatch } = await this.findOrCreateInventory(
      extractedData.productName,
      extractedData.quantity,
      generatedDefaults.categories.inventory.id,
      extractedData.retailCost,
      extractedData.endUserCost,
      generatedDefaults.defaultUser.id,
    );

    const device = await this.findOrCreateDevice(
      extractedData.serialNumber,
      extractedData.productName,
    );

    // Transform customer data with intelligent defaults
    const customerData = this.transformCustomerData(
      extractedData,
      contextualDefaults,
      generatedDefaults,
    );

    // Transform contract data with generated defaults
    const contractData = this.transformContractData(extractedData.paymentDate);

    // Create sale item data
    const saleItemData = {
      productId: product.id,
      quantity: extractedData.quantity,
      totalPrice: extractedData.totalPrice,
      monthlyPayment: extractedData.installmentAmount,
      installmentStartingPrice: extractedData.downpaymentAmount,
      // paymentMode: this.determinePaymentMode(extractedData.totalPrice),
      paymentMode: this.determinePaymentMode(extractedData.paymentPlan),
    };

    // Create sale data
    const saleData = {
      category: 'PRODUCT' as const,
      status: SalesStatus.COMPLETED,
      totalPrice: inventoryBatch.price,
      totalPaid:
        saleItemData.paymentMode == PaymentMode.ONE_OFF
          ? inventoryBatch.price
          : extractedData.downpaymentAmount,
      installmentStartingPrice: extractedData.downpaymentAmount,
      transactionDate: extractedData.paymentDate,
      totalMonthlyPayment: extractedData.installmentAmount,
      creatorId: generatedDefaults.defaultUser.id,
    };

    return {
      customerData,
      paymentDate: extractedData.paymentDate,
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
      'Customer Name',
      'customer_name',
      'name',
      'client_name',
      'CLIENT_NAME',
    ]);

    const productName = this.extractValue(row, [
      'PRODUCT',
      'Model',
      'product',
      'item',
      'product_name',
      'PRODUCT_NAME',
    ]);

    const serialNumber = this.extractValue(row, [
      'External ID (Serial No)',
      'PRODUCT SERIAL NUMBER',
      'product_serial_number',
      'serial',
      'serial_number',
      'SERIAL_NUMBER',
    ]);

    const phoneNumber = this.extractValue(row, [
      'Phone Number',
      'MOBILE_NUMBER',
      'mobile_number',
      'phone',
      'mobile',
      'contact',
    ]);

    const address = this.extractValue(row, [
      'Location (Address)',
      'ADDRESS_LINE',
      'address_line',
      'address',
      'location',
    ]);

    const state = this.extractValue(row, ['Location (State)']);

    const lga = this.extractValue(row, ['Location (LGA)']);

    const alternatePhone = this.extractValue(row, ['Alternate phone number']);

    const customerCategory = this.extractValue(row, ['Customer Category']);

    const customerType = this.extractValue(row, ['Customer Type']);

    const retailCost = this.parseNumber(
      this.extractValue(row, ['Retail Cost of System (NGN)', 'LOAN_AMOUNT']),
    );

    const endUserCost = this.parseNumber(
      this.extractValue(row, ['Cost to End User (N)']),
    );

    const paymentDate = this.parseDate(
      this.extractValue(row, ['Payment Date', 'contract DATE']),
    );

    const typeOfPayment = this.extractValue(row, ['Type of Payment']);

    const paymentPlan = this.extractValue(row, ['Payment Plan']);

    const downpaymentAmount = this.parseNumber(
      this.extractValue(row, ['Downpayment Amount (NGN)']),
    );

    const installmentAmount = this.parseNumber(
      this.extractValue(row, ['Installment Amount (NGN)']),
    );

    const quantity =
      this.parseNumber(
        this.extractValue(row, [
          'Quantity',
          'numberOfUnits', // Keep old format
        ]),
      ) || 1;

    const pvCapacity = this.extractValue(row, ['PV Capacity (W)']);

    const customerId = this.extractValue(row, ['Customer ID']);

    const gender = this.extractValue(row, [
      'Gender of Primary Account Holder',
      'client.profile.gender', // Keep old format
    ]);

    const latitude = this.extractValue(row, [
      'Latitude',
      'client.profile.gps.latitude', // Keep old format
    ]);

    const longitude = this.extractValue(row, [
      'Longitude',
      'client.profile.gps.longitude', // Keep old format
    ]);

    const totalPrice = endUserCost || 0;
    const unitPrice = quantity > 0 ? totalPrice / quantity : totalPrice;

    // Build full address
    const fullAddress = [address, lga, state].filter(Boolean).join(', ');

    return {
      customerName: customerName || 'Unknown Customer',
      productName: productName || 'Unknown Product',
      serialNumber,
      phoneNumber,
      alternatePhone,
      address,
      fullAddress,
      state,
      lga,
      totalPrice,
      unitPrice,
      retailCost: retailCost || 0,
      endUserCost: endUserCost || 0,
      paymentDate,
      quantity,
      latitude,
      longitude,
      gender,
      customerId,
      customerCategory,
      customerType,
      typeOfPayment,
      paymentPlan,
      downpaymentAmount: downpaymentAmount || 0,
      installmentAmount: installmentAmount || 0,
      pvCapacity,
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
      fullname: extractedData.customerName,
      phone: cleanPhone,
      gender: extractedData.gender,
      email: this.generateEmail(names.firstname, names.lastname, cleanPhone),
      addressType: 'HOME' as const,
      location: extractedData.address || contextualDefaults.customer.location,
      longitude:
        extractedData.longitude || contextualDefaults.customer.longitude,
      latitude: extractedData.latitude || contextualDefaults.customer.latitude,
      type: this.mapCustomerType(extractedData.customerType),
      status: 'active' as const,
      creatorId: generatedDefaults.defaultUser.id,
      alternatePhone: extractedData.alternatePhone || null,
      state: extractedData.state || null,
      lga: extractedData.lga || null,
      customerCategory: extractedData.customerCategory || null,
    };
  }

  private mapCustomerType(customerType: string): CustomerType {
    if (!customerType) return 'purchase';

    const type = customerType.toLowerCase();
    if (type.includes('lead') || type.includes('prospect')) {
      return CustomerType.lead;
    }
    if (type.includes('commercial') || type.includes('retailer')) {
      return CustomerType.Commercial_Retailer;
    }

    return CustomerType.purchase; // Default to purchase if no match
  }

  private transformContractData(paymentDate?: Date) {
    return this.defaultsGenerator.generateContractDefaults(paymentDate);
  }

  async findOrCreateProduct(
    productName: string,
    categoryId: string,
    creatorId: string,
    pvCapacity?: string,
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
        pvCapacity,
      );

      product = await this.prisma.product.create({
        data: {
          ...productDefaults,
          creatorId,
        },
      });

      wasCreated = true;
      this.logger.debug(`Created new product: ${productName}`);
    } else if (pvCapacity && !product.pvCapacity) {
      // Update existing product with PV capacity if missing
      product = await this.prisma.product.update({
        where: { id: product.id },
        data: { pvCapacity },
      });
    }

    return { ...product, wasCreated };
  }

  async findOrCreateInventory(
    productName: string,
    quantity: number = 1,
    categoryId: string,
    retailCost: number,
    costToEndUser: number,
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

    console.log({ retailCost, costToEndUser });
    // Create inventory batch
    const batchDefaults = this.defaultsGenerator.generateInventoryBatchDefaults(
      retailCost,
      costToEndUser,
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

  async findOrCreateDevice(serialNumber: string, productName?: string) {
    if (serialNumber && serialNumber.trim() !== '') {
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

    if (productName) {
      // This method now returns the created device directly
      const device = await this.generateUniqueDevice(productName);

      this.logger.debug(
        `Created new device with generated serial: ${device.serialNumber}`,
      );

      return device;
    }

    return null;
  }

  private async generateUniqueDevice(productName: string) {
    const prefix = this.extractSerialPrefix(productName);

    return await this.prisma.$transaction(async (tx) => {
      const devices = await tx.device.findMany({
        where: {
          serialNumber: {
            startsWith: prefix,
            mode: 'insensitive',
          },
        },
        select: {
          serialNumber: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let maxNumber = 0;
      const prefixLength = prefix.length;

      for (const device of devices) {
        const numberPart = device.serialNumber.substring(prefixLength);
        const number = parseInt(numberPart);

        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }

      const nextNumber = maxNumber + 1;
      const numberPadding = this.getNumberPadding(prefix);
      const serialNumber = `${prefix}${nextNumber.toString().padStart(numberPadding, '0')}`;

      const deviceDefaults =
        this.defaultsGenerator.generateDeviceDefaults(serialNumber);

      const device = await tx.device.create({
        data: deviceDefaults,
      });

      return device; // Return the actual device object
    });
  }

  private extractSerialPrefix(productName: string): string {
    const cleanName = productName.trim().toLowerCase();

    const patterns = [
      // Rule 1: Handle "Spark XW" -> "SEXW" (where X is any number)
      {
        test: /spark\s+(\d+)w/i,
        extract: (match: RegExpMatchArray) => `SE${match[1]}W`,
      },

      // Rule 2: Handle "Solar Change - SF - XXX" -> "SCXXX"
      {
        test: /solar\s+change.*?(\d+)/i,
        extract: (match: RegExpMatchArray) => `SC${match[1]}`,
      },

      // Rule 3: Handle "Product Name - Model XXX" -> "PNXXX"
      {
        test: /^([a-z]+).*?(\d+)$/i,
        extract: (match: RegExpMatchArray, name: string) => {
          const words = name.split(/[\s\-_]+/).filter((w) => w.length > 0);
          const initials = words
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join('');
          return `${initials}${match[2]}`;
        },
      },

      // Rule 4: Extract wattage patterns "XXW" anywhere in name
      {
        test: /(\d+)w/i,
        extract: (match: RegExpMatchArray, name: string) => {
          const firstWord = name.split(/[\s\-_]+/)[0];
          const initial = firstWord
            ? firstWord.substring(0, 2).toUpperCase()
            : 'PR';
          return `${initial}${match[1]}W`;
        },
      },

      // Rule 5: Category-based prefixes with model numbers
      {
        test: /(solar|battery|inverter|charge).*?(\d+)/i,
        extract: (match: RegExpMatchArray) => {
          const categoryMap = {
            solar: 'SOL',
            battery: 'BAT',
            inverter: 'INV',
            charge: 'CHG',
          };
          const category = categoryMap[match[1].toLowerCase()] || 'SOL';
          return `${category}${match[2]}`;
        },
      },
    ];

    // Try each pattern
    for (const pattern of patterns) {
      const match = cleanName.match(pattern.test);
      if (match) {
        return pattern.extract(match, cleanName);
      }
    }

    return this.createIntelligentFallback(cleanName);
  }

  private createIntelligentFallback(productName: string): string {
    // Split into meaningful words (remove common connector words)
    const stopWords = [
      'and',
      'or',
      'the',
      'with',
      'for',
      'in',
      'on',
      'at',
      'to',
    ];
    const words = productName
      .toLowerCase()
      .split(/[\s\-_\(\)\.]+/)
      .filter((word) => word.length > 1 && !stopWords.includes(word))
      .slice(0, 3); // Take first 3 significant words

    if (words.length === 0) {
      return 'DEV';
    }

    // Extract numbers if present
    const numbers = productName.match(/\d+/g);
    const significantNumber = numbers ? numbers[0] : '';

    if (words.length === 1) {
      // Single word: take first 3-4 chars + number if available
      const base = words[0]
        .substring(0, significantNumber ? 3 : 4)
        .toUpperCase();
      return significantNumber ? `${base}${significantNumber}` : base;
    } else {
      // Multiple words: take first 1-2 chars from each word
      const charsPerWord = Math.max(1, Math.floor(4 / words.length));
      const base = words
        .map((word) => word.substring(0, charsPerWord).toUpperCase())
        .join('')
        .substring(0, 4);

      return significantNumber ? `${base}${significantNumber}` : base;
    }
  }

  private getNumberPadding(prefix: string): number {
    // Determine padding based on prefix characteristics
    if (prefix.length <= 3) {
      return 6; // Shorter prefix, longer number: ABC123456
    } else if (prefix.length <= 5) {
      return 4; // Medium prefix: ABCDE1234
    } else {
      return 3; // Longer prefix: ABCDEFG123
    }
  }

  private generateBusinessHourDateTime(date: Date | string): Date {
    let baseDate: Date;

    if (date instanceof Date) {
      baseDate = new Date(date);
    } else if (typeof date === 'string') {
      const parsedDate = this.parseDate(date);
      if (parsedDate) {
        baseDate = parsedDate;
      } else {
        console.warn(
          `Failed to parse date string: ${date}, using current date`,
        );
        baseDate = new Date();
      }
    } else {
      console.warn(`Invalid date type: ${typeof date}, using current date`);
      baseDate = new Date();
    }

    if (isNaN(baseDate.getTime())) {
      console.warn(`Invalid date detected, using current date instead`);
      baseDate = new Date();
    }

    // Check if it's a weekend and adjust to nearest weekday if needed
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0) {
      // Sunday -> move to Monday
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // Saturday -> move to Friday
      baseDate.setDate(baseDate.getDate() - 1);
    }

    // Define business hours with lunch break consideration
    const businessPeriods = [
      { start: 8, end: 12 }, // Morning: 8 AM - 12 PM
      { start: 13, end: 18 }, // Afternoon: 1 PM - 6 PM
    ];

    // Randomly choose morning or afternoon
    const period =
      businessPeriods[Math.floor(Math.random() * businessPeriods.length)];

    // Generate random time within the chosen period
    const randomHour =
      Math.floor(Math.random() * (period.end - period.start)) + period.start;
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomSeconds = Math.floor(Math.random() * 60);

    baseDate.setHours(randomHour, randomMinutes, randomSeconds, 0);

    return baseDate;
  }
  async transformTransactionToPayment(
    row: TransactionsCsvRowDto,
    saleId?: string,
  ) {
    const extractedData = this.extractTransactionData(row);

    const businessHourDateTime = extractedData.date
      ? this.generateBusinessHourDateTime(extractedData.date)
      : new Date();

    return {
      transactionRef: extractedData.reference,
      amount: extractedData.amount,
      paymentStatus: 'COMPLETED' as const,
      paymentDate: businessHourDateTime,
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

    let reference = this.extractValue(row, [
      'reference',
      'ref',
      'receipt',
      'transaction_ref',
    ]);

    if (!reference || reference.trim() === '') {
      reference = this.generateTransactionReference(transactionId);
    }

    const dateString = this.extractValue(row, [
      'date',
      'transaction_date',
      'payment_date',
      'timestamp',
    ]);

    const date = this.parseDate(dateString);

    return {
      transactionId,
      amount: amount || 0,
      reference: reference || `TXN_${Date.now()}`,
      date: date || new Date(),
      dateString,
    };
  }

  private generateTransactionReference(transactionId?: string): string {
    if (transactionId && transactionId.trim() !== '') {
      return `sale-${transactionId.trim()}`;
    }

    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `sale-${timestamp}${random}`;
  }

  // Business logic methods
  // private determinePaymentMode(amount: number): 'ONE_OFF' | 'INSTALLMENT' {
  //   return amount > 100000 ? 'INSTALLMENT' : 'ONE_OFF';
  // }
  private determinePaymentMode(mode: string): PaymentMode {
    if (
      mode.toLowerCase().includes('outright') ||
      mode.toLowerCase().includes('one-off')
    ) {
      return PaymentMode.ONE_OFF;
    }

    return PaymentMode.INSTALLMENT;
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
    // const timestamp = Date.now().toString().slice(-4);
    return `${baseEmail}.${phoneHash}@gmail.com`;
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
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);

          if (
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year) &&
            day >= 1 &&
            day <= 31 &&
            month >= 0 &&
            month <= 11 &&
            year >= 1900 &&
            year <= 2100
          ) {
            return new Date(year, month, day);
          }
        }
      }

      // If DD/MM/YYYY parsing fails, try standard Date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error);
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
