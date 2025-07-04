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
var DataMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMappingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const defaults_generator_service_1 = require("./defaults-generator.service");
const client_1 = require("@prisma/client");
let DataMappingService = DataMappingService_1 = class DataMappingService {
    constructor(prisma, defaultsGenerator) {
        this.prisma = prisma;
        this.defaultsGenerator = defaultsGenerator;
        this.logger = new common_1.Logger(DataMappingService_1.name);
    }
    async transformSalesRowToDatabase(row, generatedDefaults) {
        const contextualDefaults = this.defaultsGenerator.generateContextualDefaults(row, 'sales');
        const extractedData = this.extractSalesData(row);
        const product = await this.findOrCreateProduct(extractedData.productName, generatedDefaults.categories.product.id, generatedDefaults.defaultUser.id);
        const { inventory, inventoryBatch } = await this.findOrCreateInventory(extractedData.productName, extractedData.quantity, generatedDefaults.categories.inventory.id, extractedData.unitPrice, generatedDefaults.defaultUser.id);
        const device = await this.findOrCreateDevice(extractedData.serialNumber);
        const customerData = this.transformCustomerData(extractedData, contextualDefaults, generatedDefaults);
        const contractData = this.transformContractData();
        const saleItemData = {
            productId: product.id,
            quantity: extractedData.quantity,
            totalPrice: extractedData.totalPrice,
            paymentMode: this.determinePaymentMode(extractedData.totalPrice),
        };
        const saleData = {
            category: 'PRODUCT',
            status: client_1.SalesStatus.COMPLETED,
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
    extractSalesData(row) {
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
        const loanAmount = this.parseNumber(this.extractValue(row, [
            'LOAN_AMOUNT',
            'loan_amount',
            'amount',
            'total',
            'price',
        ]));
        const contractNumber = this.extractValue(row, [
            'contractNumber',
            'contract_number',
            'contract_id',
            'CONTRACT_NUMBER',
        ]);
        const contractDate = this.parseDate(this.extractValue(row, [
            'contract DATE',
            'contract_date',
            'date',
            'CONTRACT_DATE',
        ]));
        const numberOfUnits = this.parseNumber(this.extractValue(row, [
            'numberOfUnits',
            'number_of_units',
            'units',
            'quantity',
            'qty',
        ])) || 1;
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
        const unitPrice = numberOfUnits > 0 ? totalPrice / numberOfUnits : totalPrice;
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
    transformCustomerData(extractedData, contextualDefaults, generatedDefaults) {
        const names = this.parseFullName(extractedData.customerName);
        const cleanPhone = this.cleanPhoneNumber(extractedData.phoneNumber);
        return {
            firstname: names.firstname,
            lastname: names.lastname,
            phone: cleanPhone,
            email: this.generateEmail(names.firstname, names.lastname, cleanPhone),
            addressType: 'HOME',
            location: extractedData.address || contextualDefaults.customer.location,
            longitude: extractedData.longitude || contextualDefaults.customer.longitude,
            latitude: extractedData.latitude || contextualDefaults.customer.latitude,
            type: 'purchase',
            status: 'active',
            creatorId: generatedDefaults.defaultUser.id,
        };
    }
    transformContractData() {
        return this.defaultsGenerator.generateContractDefaults();
    }
    async findOrCreateProduct(productName, categoryId, creatorId) {
        if (!productName ||
            productName.trim() === '' ||
            productName === 'Unknown Product') {
            productName = 'Migrated Product ' + Date.now();
        }
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
            const productDefaults = this.defaultsGenerator.generateProductDefaults(productName.trim(), categoryId);
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
    async findOrCreateInventory(productName, quantity = 1, categoryId, price, creatorId) {
        let inventory = await this.prisma.inventory.findFirst({
            where: {
                name: {
                    equals: productName.trim(),
                    mode: 'insensitive',
                },
            },
        });
        if (!inventory) {
            const inventoryDefaults = this.defaultsGenerator.generateInventoryDefaults(productName.trim(), categoryId);
            inventory = await this.prisma.inventory.create({
                data: inventoryDefaults,
            });
        }
        const batchDefaults = this.defaultsGenerator.generateInventoryBatchDefaults(price, quantity);
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
    async findOrCreateDevice(serialNumber) {
        if (!serialNumber || serialNumber.trim() === '') {
            return null;
        }
        let device = await this.prisma.device.findUnique({
            where: { serialNumber: serialNumber.trim() },
        });
        if (!device) {
            const deviceDefaults = this.defaultsGenerator.generateDeviceDefaults(serialNumber.trim());
            device = await this.prisma.device.create({
                data: deviceDefaults,
            });
            this.logger.debug(`Created new device: ${serialNumber}`);
        }
        return device;
    }
    generateBusinessHourDateTime(date) {
        let baseDate;
        if (date instanceof Date) {
            baseDate = new Date(date);
        }
        else if (typeof date === 'string') {
            const parsedDate = this.parseDate(date);
            if (parsedDate) {
                baseDate = parsedDate;
            }
            else {
                console.warn(`Failed to parse date string: ${date}, using current date`);
                baseDate = new Date();
            }
        }
        else {
            console.warn(`Invalid date type: ${typeof date}, using current date`);
            baseDate = new Date();
        }
        if (isNaN(baseDate.getTime())) {
            console.warn(`Invalid date detected, using current date instead`);
            baseDate = new Date();
        }
        const dayOfWeek = baseDate.getDay();
        if (dayOfWeek === 0) {
            baseDate.setDate(baseDate.getDate() + 1);
        }
        else if (dayOfWeek === 6) {
            baseDate.setDate(baseDate.getDate() - 1);
        }
        const businessPeriods = [
            { start: 8, end: 12 },
            { start: 13, end: 18 },
        ];
        const period = businessPeriods[Math.floor(Math.random() * businessPeriods.length)];
        const randomHour = Math.floor(Math.random() * (period.end - period.start)) + period.start;
        const randomMinutes = Math.floor(Math.random() * 60);
        const randomSeconds = Math.floor(Math.random() * 60);
        baseDate.setHours(randomHour, randomMinutes, randomSeconds, 0);
        return baseDate;
    }
    async transformTransactionToPayment(row, saleId) {
        const extractedData = this.extractTransactionData(row);
        const businessHourDateTime = extractedData.date
            ? this.generateBusinessHourDateTime(extractedData.date)
            : new Date();
        return {
            transactionRef: extractedData.reference,
            amount: extractedData.amount,
            paymentStatus: 'COMPLETED',
            paymentDate: businessHourDateTime,
            saleId: saleId || null,
        };
    }
    extractTransactionData(row) {
        const transactionId = this.extractValue(row, [
            'transactionId',
            'transaction_id',
            'trans_id',
            'payment_id',
        ]);
        const amount = this.parseNumber(this.extractValue(row, ['amount', 'value', 'sum', 'total']));
        const reference = this.extractValue(row, [
            'reference',
            'ref',
            'receipt',
            'transaction_ref',
        ]) || transactionId;
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
    determinePaymentMode(amount) {
        return amount > 100000 ? 'INSTALLMENT' : 'ONE_OFF';
    }
    extractValue(row, possibleKeys) {
        for (const key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key].toString().trim();
            }
            const foundKey = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
            if (foundKey &&
                row[foundKey] !== undefined &&
                row[foundKey] !== null &&
                row[foundKey] !== '') {
                return row[foundKey].toString().trim();
            }
        }
        return null;
    }
    parseFullName(fullName) {
        if (!fullName || fullName.trim() === '') {
            return { firstname: 'Unknown', lastname: 'Customer' };
        }
        const names = fullName
            .trim()
            .split(' ')
            .filter((name) => name.length > 0);
        if (names.length === 0) {
            return { firstname: 'Unknown', lastname: 'Customer' };
        }
        else if (names.length === 1) {
            return { firstname: names[0], lastname: 'Customer' };
        }
        else {
            return {
                firstname: names[0],
                lastname: names.slice(1).join(' '),
            };
        }
    }
    cleanPhoneNumber(phone) {
        if (!phone)
            return '+234##########';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('234')) {
            return cleaned;
        }
        else if (cleaned.startsWith('0') && cleaned.length === 11) {
            return '234' + cleaned.substring(1);
        }
        else if (cleaned.length === 10) {
            return '234' + cleaned;
        }
        return cleaned || this.defaultsGenerator.generateNigerianPhone();
    }
    generateEmail(firstname, lastname, phone) {
        const baseEmail = `${firstname.toLowerCase()}.${lastname.toLowerCase()}`;
        const phoneHash = phone.slice(-4);
        return `${baseEmail}.${phoneHash}@gmail.com`;
    }
    parseNumber(value) {
        if (!value || typeof value !== 'string')
            return null;
        const cleaned = value.replace(/[₦$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }
    parseDate(dateString) {
        if (!dateString)
            return null;
        try {
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (!isNaN(day) &&
                        !isNaN(month) &&
                        !isNaN(year) &&
                        day >= 1 &&
                        day <= 31 &&
                        month >= 0 &&
                        month <= 11 &&
                        year >= 1900 &&
                        year <= 2100) {
                        return new Date(year, month, day);
                    }
                }
            }
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
            return null;
        }
        catch (error) {
            console.error(`Error parsing date: ${dateString}`, error);
            return null;
        }
    }
    async getNextBatchNumber(inventoryId) {
        const lastBatch = await this.prisma.inventoryBatch.findFirst({
            where: { inventoryId },
            orderBy: { batchNumber: 'desc' },
        });
        return (lastBatch?.batchNumber || 0) + 1;
    }
};
exports.DataMappingService = DataMappingService;
exports.DataMappingService = DataMappingService = DataMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        defaults_generator_service_1.DefaultsGeneratorService])
], DataMappingService);
//# sourceMappingURL=data-mapping.service.js.map