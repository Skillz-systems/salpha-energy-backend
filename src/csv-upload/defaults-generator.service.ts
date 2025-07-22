import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../utils/helpers.util';
import { generateRandomPassword } from '../utils/generate-pwd';
import { IDType } from '@prisma/client';

@Injectable()
export class DefaultsGeneratorService {
  private readonly logger = new Logger(DefaultsGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateDefaults(): Promise<{
    categories: { product: any; inventory: any };
    defaultUser: any;
    inventoryCategories: any[];
    defaultRole: any;
  }> {
    this.logger.log('Generating default entities for migration');

    const defaults = {
      categories: await this.ensureDefaultCategories(),
      defaultUser: await this.ensureDefaultUser(),
      inventoryCategories: await this.ensureInventoryCategories(),
      defaultRole: await this.ensureDefaultRole(),
    };

    this.logger.log('Default entities generated successfully');
    return defaults;
  }

  private async ensureDefaultCategories(): Promise<{
    product: any;
    inventory: any;
  }> {
    let productCategory = await this.prisma.category.findFirst({
      where: {
        type: 'PRODUCT',
        name: 'Migrated Products',
      },
    });

    if (!productCategory) {
      productCategory = await this.prisma.category.create({
        data: {
          name: 'Migrated Products',
          type: 'PRODUCT',
        },
      });
      this.logger.log('Created default product category');
    }

    let inventoryCategory = await this.prisma.category.findFirst({
      where: {
        type: 'INVENTORY',
        name: 'Migrated Inventory',
      },
    });

    if (!inventoryCategory) {
      inventoryCategory = await this.prisma.category.create({
        data: {
          name: 'Migrated Inventory',
          type: 'INVENTORY',
        },
      });
      this.logger.log('Created default inventory category');
    }

    return {
      product: productCategory,
      inventory: inventoryCategory,
    };
  }

  private async ensureDefaultUser(): Promise<any> {
    let defaultUser = await this.prisma.user.findFirst({
      where: { email: 'migration.agent@system.local' },
    });

    if (!defaultUser) {
      const defaultRole = await this.ensureDefaultRole();

      defaultUser = await this.prisma.user.create({
        data: {
          email: 'migration.agent@system.local',
          password: await hashPassword(generateRandomPassword(16)),
          firstname: 'Migration',
          lastname: 'Agent',
          username: 'migration_agent',
          roleId: defaultRole.id,
          phone: faker.phone.number({ style: 'national' }),
          location: 'System Generated',
          addressType: 'WORK',
          status: 'active',
        },
      });

      this.logger.log('Created default migration user');
    }

    return defaultUser;
  }

  private async ensureDefaultRole(): Promise<any> {
    let defaultRole = await this.prisma.role.findFirst({
      where: { role: 'Migration Agent' },
    });

    if (!defaultRole) {
      const permissions = await this.createMigrationPermissions();

      defaultRole = await this.prisma.role.create({
        data: {
          role: 'Migration Agent',
          active: true,
          permissionIds: permissions.map((p) => p.id),
        },
      });

      this.logger.log('Created default migration role');
    }

    return defaultRole;
  }

  private async createMigrationPermissions(): Promise<any[]> {
    const requiredPermissions = [
      { action: 'write', subject: 'Customers' },
      { action: 'write', subject: 'Sales' },
      { action: 'write', subject: 'Products' },
      { action: 'write', subject: 'Inventory' },
      { action: 'write', subject: 'Contracts' },
      { action: 'read', subject: 'all' },
    ];

    const permissions = [];

    for (const perm of requiredPermissions) {
      let permission = await this.prisma.permission.findFirst({
        where: {
          action: perm.action as any,
          subject: perm.subject as any,
        },
      });

      if (!permission) {
        permission = await this.prisma.permission.create({
          data: {
            action: perm.action as any,
            subject: perm.subject as any,
            roleIds: [],
          },
        });
      }

      permissions.push(permission);
    }

    return permissions;
  }

  private async ensureInventoryCategories(): Promise<any[]> {
    const categories = ['Box'];

    const inventoryCategories = [];

    for (const categoryName of categories) {
      let category = await this.prisma.category.findFirst({
        where: {
          name: categoryName,
          type: 'INVENTORY',
        },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: categoryName,
            type: 'INVENTORY',
          },
        });
      }

      inventoryCategories.push(category);
    }

    return inventoryCategories;
  }

  generateCustomerDefaults(existingData: any = {}): any {
    return {
      firstname: existingData.firstname || faker.person.firstName(),
      lastname: existingData.lastname || faker.person.lastName(),
      email: existingData.email || faker.internet.email().toLowerCase(),
      phone: existingData.phone || faker.phone.number({ style: 'national' }),
      addressType: 'HOME' as const,
      location: existingData.location || this.generateNigerianAddress(),
      longitude:
        existingData.longitude ||
        faker.location.longitude({ min: 2.5, max: 14.8 }).toString(),
      latitude:
        existingData.latitude ||
        faker.location.latitude({ min: 4.0, max: 14.0 }).toString(),
      type: 'purchase' as const,
      status: 'active' as const,
    };
  }

  generateContractDefaults(paymentDate?: Date) {
    const contractDate = paymentDate || new Date();

    console.log({ contractDate });

    return {
      initialAmountPaid: 0,

      nextOfKinFullName: 'nil',
      nextOfKinRelationship: faker.helpers.arrayElement([
        'Spouse',
        'Parent',
        'Sibling',
        'Child',
        'Friend',
      ]),
      nextOfKinPhoneNumber: 'nil',
      nextOfKinHomeAddress: 'nil',
      nextOfKinEmail: 'nil',
      nextOfKinDateOfBirth: null,
      nextOfKinNationality: 'nil',
      guarantorFullName: 'nil',
      guarantorPhoneNumber: 'nil',
      guarantorHomeAddress: 'nil',
      guarantorEmail: 'nil',
      guarantorIdType: IDType.Nil,
      guarantorIdNumber: 'nil',
      guarantorIdIssuingCountry: 'nil',
      guarantorIdIssueDate: null,
      guarantorIdExpirationDate: null,
      guarantorNationality: 'nil',
      guarantorDateOfBirth: null,

      idType: IDType.Nil,
      idNumber: 'nil',
      issuingCountry: 'nil',
      issueDate: null,
      expirationDate: null,
      fullNameAsOnID: 'nil',
      addressAsOnID: 'nil',

      signedAt: null,
    };
  }

  generateProductDefaults(
    productName: string,
    categoryId: string,
    pvCapacity?: string,
  ): any {
    return {
      name: productName,
      paymentModes: 'ONE_OFF,INSTALLMENT',
      categoryId,
      pvCapacity: pvCapacity || null,
    };
  }

  generateInventoryDefaults(productName: string, categoryId: string): any {
    return {
      name: productName,
      manufacturerName: 'nil',
      class: 'REGULAR' as const,
      inventoryCategoryId: categoryId,
    };
  }

  generateInventoryBatchDefaults(
    retailCost: number,
    costToEndUser: number,
    quantity: number,
  ): any {
    return {
      costOfItem: retailCost || costToEndUser,
      price: costToEndUser || retailCost,
      batchNumber: 1,
      numberOfStock: quantity || 1,
      remainingQuantity: quantity || 1,
    };
  }

  generateDeviceDefaults(serialNumber?: string): any {
    return {
      serialNumber: serialNumber || this.generateSerialNumber(),
      key: this.generateDeviceKey(),
      startingCode: '--',
      isUsed: true,
    };
  }

  generateNigerianPhone(): string {
    const prefixes = [
      '803',
      '806',
      '813',
      '816',
      '810',
      '814',
      '903',
      '906',
      '915',
      '905',
    ];
    const prefix = faker.helpers.arrayElement(prefixes);
    const number = faker.string.numeric(7);
    return `234${prefix}${number}`;
  }

  private generateNigerianAddress(): string {
    const states = [
      'Lagos',
      'Abuja',
      'Kano',
      'Ibadan',
      'Port Harcourt',
      'Benin City',
      'Maiduguri',
      'Zaria',
      'Aba',
      'Jos',
      'Ilorin',
      'Oyo',
      'Enugu',
      'Kaduna',
      'Katsina',
    ];

    const areas = [
      'Victoria Island',
      'Ikeja',
      'Surulere',
      'Yaba',
      'Lekki',
      'Garki',
      'Wuse',
      'Asokoro',
      'Central Area',
      'Kubwa',
    ];

    const state = faker.helpers.arrayElement(states);
    const area = faker.helpers.arrayElement(areas);
    const street = faker.location.streetAddress();

    return `${street}, ${area}, ${state} State, Nigeria`;
  }

  private generateSKU(): string {
    const prefix = faker.helpers.arrayElement([
      'ELE',
      'SOL',
      'BAT',
      'INV',
      'ACC',
    ]);
    const number = faker.string.numeric(6);
    return `${prefix}-${number}`;
  }

  private generateSerialNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = faker.string.numeric(2);
    return `SE${timestamp}${random}`;
  }

  private generateDeviceKey(): string {
    return faker.string.alphanumeric(32);
  }

  generateContextualDefaults(
    rowData: any,
    dataType: 'sales' | 'transactions',
  ): any {
    if (dataType === 'sales') {
      return this.generateSalesContextualDefaults(rowData);
    } else {
      return this.generateTransactionContextualDefaults(rowData);
    }
  }

  private generateSalesContextualDefaults(rowData: any): any {
    const customerName = this.extractCustomerName(rowData);
    const productName = this.extractProductName(rowData);
    const amount = this.extractAmount(rowData);
    const phone = this.extractPhone(rowData);
    const address = this.extractAddress(rowData);

    return {
      customer: {
        ...this.generateCustomerDefaults(),
        firstname: customerName?.firstname || faker.person.firstName(),
        lastname: customerName?.lastname || faker.person.lastName(),
        phone: phone || this.generateNigerianPhone(),
        location: address || this.generateNigerianAddress(),
      },
      product: {
        name: productName || 'Unknown Product',
        description: `Migrated product${productName ? `: ${productName}` : ''}`,
        currency: 'NGN',
      },
      sale: {
        totalPrice: amount || faker.number.int({ min: 50000, max: 500000 }),
        status: 'COMPLETED' as const,
        category: 'PRODUCT' as const,
      },
    };
  }

  private generateTransactionContextualDefaults(rowData: any): any {
    const amount = this.extractAmount(rowData);
    const reference = this.extractReference(rowData);
    const date = this.extractDate(rowData);

    return {
      payment: {
        amount: amount || faker.number.int({ min: 5000, max: 100000 }),
        transactionRef: reference || faker.string.alphanumeric(12),
        paymentDate: date || faker.date.recent({ days: 30 }),
        paymentStatus: 'COMPLETED' as const,
      },
    };
  }

  private extractCustomerName(
    rowData: any,
  ): { firstname: string; lastname: string } | null {
    const nameFields = [
      'CUSTOMER_NAME',
      'customer_name',
      'name',
      'client_name',
      'CLIENT_NAME',
    ];

    for (const field of nameFields) {
      if (rowData[field]) {
        const fullName = rowData[field].toString().trim();
        const nameParts = fullName.split(' ').filter((part) => part.length > 0);

        if (nameParts.length > 0) {
          return {
            firstname: nameParts[0],
            lastname: nameParts.slice(1).join(' ') || 'Customer',
          };
        }
      }
    }

    return null;
  }

  private extractProductName(rowData: any): string | null {
    const productFields = [
      'PRODUCT',
      'product',
      'item',
      'product_name',
      'PRODUCT_NAME',
    ];

    for (const field of productFields) {
      if (rowData[field]) {
        return rowData[field].toString().trim();
      }
    }

    return null;
  }

  private extractAmount(rowData: any): number | null {
    const amountFields = [
      'LOAN_AMOUNT',
      'loan_amount',
      'amount',
      'total',
      'price',
      'value',
    ];

    for (const field of amountFields) {
      if (rowData[field]) {
        const cleaned = rowData[field].toString().replace(/[₦$,\s]/g, '');
        const amount = parseFloat(cleaned);
        if (!isNaN(amount)) {
          return amount;
        }
      }
    }

    return null;
  }

  private extractPhone(rowData: any): string | null {
    const phoneFields = [
      'MOBILE_NUMBER',
      'mobile_number',
      'phone',
      'mobile',
      'contact',
    ];

    for (const field of phoneFields) {
      if (rowData[field]) {
        const phone = rowData[field].toString().replace(/\D/g, '');
        if (phone.length >= 10) {
          if (phone.startsWith('234')) return phone;
          if (phone.startsWith('0')) return '234' + phone.substring(1);
          if (phone.length === 10) return '234' + phone;
        }
      }
    }

    return null;
  }

  private extractAddress(rowData: any): string | null {
    const addressFields = [
      'ADDRESS_LINE',
      'address_line',
      'address',
      'location',
    ];

    for (const field of addressFields) {
      if (rowData[field]) {
        return rowData[field].toString().trim();
      }
    }

    return null;
  }

  private extractReference(rowData: any): string | null {
    const refFields = [
      'reference',
      'ref',
      'transaction_ref',
      'transactionId',
      'transaction_id',
    ];

    for (const field of refFields) {
      if (rowData[field]) {
        return rowData[field].toString().trim();
      }
    }

    return null;
  }

  private extractDate(rowData: any): Date | null {
    const dateFields = [
      'date',
      'transaction_date',
      'payment_date',
      'created_at',
    ];

    for (const field of dateFields) {
      if (rowData[field]) {
        const date = new Date(rowData[field]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }
}
