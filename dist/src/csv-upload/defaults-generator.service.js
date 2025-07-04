"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DefaultsGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultsGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const faker_1 = require("@faker-js/faker");
const helpers_util_1 = require("../utils/helpers.util");
const generate_pwd_1 = require("../utils/generate-pwd");
const client_1 = require("@prisma/client");
let DefaultsGeneratorService = DefaultsGeneratorService_1 = class DefaultsGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DefaultsGeneratorService_1.name);
    }
    async generateDefaults() {
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
    async ensureDefaultCategories() {
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
    async ensureDefaultUser() {
        let defaultUser = await this.prisma.user.findFirst({
            where: { email: 'migration.agent@system.local' },
        });
        if (!defaultUser) {
            const defaultRole = await this.ensureDefaultRole();
            defaultUser = await this.prisma.user.create({
                data: {
                    email: 'migration.agent@system.local',
                    password: await (0, helpers_util_1.hashPassword)((0, generate_pwd_1.generateRandomPassword)(16)),
                    firstname: 'Migration',
                    lastname: 'Agent',
                    username: 'migration_agent',
                    roleId: defaultRole.id,
                    phone: faker_1.faker.phone.number({ style: 'national' }),
                    location: 'System Generated',
                    addressType: 'WORK',
                    status: 'active',
                },
            });
            this.logger.log('Created default migration user');
        }
        return defaultUser;
    }
    async ensureDefaultRole() {
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
    async createMigrationPermissions() {
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
                    action: perm.action,
                    subject: perm.subject,
                },
            });
            if (!permission) {
                permission = await this.prisma.permission.create({
                    data: {
                        action: perm.action,
                        subject: perm.subject,
                        roleIds: [],
                    },
                });
            }
            permissions.push(permission);
        }
        return permissions;
    }
    async ensureInventoryCategories() {
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
    generateCustomerDefaults(existingData = {}) {
        return {
            firstname: existingData.firstname || faker_1.faker.person.firstName(),
            lastname: existingData.lastname || faker_1.faker.person.lastName(),
            email: existingData.email || faker_1.faker.internet.email().toLowerCase(),
            phone: existingData.phone || faker_1.faker.phone.number({ style: 'national' }),
            addressType: 'HOME',
            location: existingData.location || this.generateNigerianAddress(),
            longitude: existingData.longitude ||
                faker_1.faker.location.longitude({ min: 2.5, max: 14.8 }).toString(),
            latitude: existingData.latitude ||
                faker_1.faker.location.latitude({ min: 4.0, max: 14.0 }).toString(),
            type: 'purchase',
            status: 'active',
        };
    }
    generateContractDefaults() {
        return {
            initialAmountPaid: 0,
            nextOfKinFullName: 'nil',
            nextOfKinRelationship: faker_1.faker.helpers.arrayElement([
                'Spouse',
                'Parent',
                'Sibling',
                'Child',
                'Friend',
            ]),
            nextOfKinPhoneNumber: 'nil',
            nextOfKinHomeAddress: 'nil',
            nextOfKinEmail: 'nil',
            nextOfKinDateOfBirth: faker_1.faker.date.past({ years: 100 }),
            nextOfKinNationality: 'nil',
            guarantorFullName: 'nil',
            guarantorPhoneNumber: 'nil',
            guarantorHomeAddress: 'nil',
            guarantorEmail: 'nil',
            guarantorIdType: client_1.IDType.Nil,
            guarantorIdNumber: 'nil',
            guarantorIdIssuingCountry: 'nil',
            guarantorIdIssueDate: faker_1.faker.date.past({ years: 100 }),
            guarantorIdExpirationDate: faker_1.faker.date.past({ years: 100 }),
            guarantorNationality: 'nil',
            guarantorDateOfBirth: faker_1.faker.date.past({ years: 100 }),
            idType: client_1.IDType.Nil,
            idNumber: 'nil',
            issuingCountry: 'nil',
            issueDate: faker_1.faker.date.past({ years: 100 }),
            expirationDate: faker_1.faker.date.past({ years: 100 }),
            fullNameAsOnID: 'nil',
            addressAsOnID: 'nil',
            signedAt: faker_1.faker.date.past({ years: 100 }),
        };
    }
    generateProductDefaults(productName, categoryId) {
        return {
            name: productName,
            paymentModes: 'ONE_OFF,INSTALLMENT',
            categoryId,
        };
    }
    generateInventoryDefaults(productName, categoryId) {
        return {
            name: productName,
            manufacturerName: 'nil',
            class: 'REGULAR',
            inventoryCategoryId: categoryId,
        };
    }
    generateInventoryBatchDefaults(price, quantity) {
        return {
            price: price || faker_1.faker.number.int({ min: 10000, max: 500000 }),
            costOfItem: price || faker_1.faker.number.int({ min: 10000, max: 500000 }),
            batchNumber: 1,
            numberOfStock: quantity || faker_1.faker.number.int({ min: 1, max: 100 }),
            remainingQuantity: quantity || faker_1.faker.number.int({ min: 1, max: 100 }),
        };
    }
    generateDeviceDefaults(serialNumber) {
        return {
            serialNumber: serialNumber || this.generateSerialNumber(),
            key: this.generateDeviceKey(),
            startingCode: '--',
            isUsed: true,
        };
    }
    generateNigerianPhone() {
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
        const prefix = faker_1.faker.helpers.arrayElement(prefixes);
        const number = faker_1.faker.string.numeric(7);
        return `234${prefix}${number}`;
    }
    generateNigerianAddress() {
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
        const state = faker_1.faker.helpers.arrayElement(states);
        const area = faker_1.faker.helpers.arrayElement(areas);
        const street = faker_1.faker.location.streetAddress();
        return `${street}, ${area}, ${state} State, Nigeria`;
    }
    generateSKU() {
        const prefix = faker_1.faker.helpers.arrayElement([
            'ELE',
            'SOL',
            'BAT',
            'INV',
            'ACC',
        ]);
        const number = faker_1.faker.string.numeric(6);
        return `${prefix}-${number}`;
    }
    generateSerialNumber() {
        const letters = faker_1.faker.string.alpha({ length: 3, casing: 'upper' });
        const numbers = faker_1.faker.string.numeric(8);
        return `${letters}${numbers}`;
    }
    generateDeviceKey() {
        return faker_1.faker.string.alphanumeric(32);
    }
    generateContextualDefaults(rowData, dataType) {
        if (dataType === 'sales') {
            return this.generateSalesContextualDefaults(rowData);
        }
        else {
            return this.generateTransactionContextualDefaults(rowData);
        }
    }
    generateSalesContextualDefaults(rowData) {
        const customerName = this.extractCustomerName(rowData);
        const productName = this.extractProductName(rowData);
        const amount = this.extractAmount(rowData);
        const phone = this.extractPhone(rowData);
        const address = this.extractAddress(rowData);
        return {
            customer: {
                ...this.generateCustomerDefaults(),
                firstname: customerName?.firstname || faker_1.faker.person.firstName(),
                lastname: customerName?.lastname || faker_1.faker.person.lastName(),
                phone: phone || this.generateNigerianPhone(),
                location: address || this.generateNigerianAddress(),
            },
            product: {
                name: productName || 'Unknown Product',
                description: `Migrated product${productName ? `: ${productName}` : ''}`,
                currency: 'NGN',
            },
            sale: {
                totalPrice: amount || faker_1.faker.number.int({ min: 50000, max: 500000 }),
                status: 'COMPLETED',
                category: 'PRODUCT',
            },
        };
    }
    generateTransactionContextualDefaults(rowData) {
        const amount = this.extractAmount(rowData);
        const reference = this.extractReference(rowData);
        const date = this.extractDate(rowData);
        return {
            payment: {
                amount: amount || faker_1.faker.number.int({ min: 5000, max: 100000 }),
                transactionRef: reference || faker_1.faker.string.alphanumeric(12),
                paymentDate: date || faker_1.faker.date.recent({ days: 30 }),
                paymentStatus: 'COMPLETED',
            },
        };
    }
    extractCustomerName(rowData) {
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
    extractProductName(rowData) {
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
    extractAmount(rowData) {
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
    extractPhone(rowData) {
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
                    if (phone.startsWith('234'))
                        return phone;
                    if (phone.startsWith('0'))
                        return '234' + phone.substring(1);
                    if (phone.length === 10)
                        return '234' + phone;
                }
            }
        }
        return null;
    }
    extractAddress(rowData) {
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
    extractReference(rowData) {
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
    extractDate(rowData) {
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
};
exports.DefaultsGeneratorService = DefaultsGeneratorService;
exports.DefaultsGeneratorService = DefaultsGeneratorService = DefaultsGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DefaultsGeneratorService);
//# sourceMappingURL=defaults-generator.service.js.map