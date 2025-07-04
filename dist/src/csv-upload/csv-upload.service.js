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
var CsvUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const data_mapping_service_1 = require("./data-mapping.service");
const defaults_generator_service_1 = require("./defaults-generator.service");
const file_parser_service_1 = require("./file-parser.service");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const csv_upload_dto_1 = require("./dto/csv-upload.dto");
let CsvUploadService = CsvUploadService_1 = class CsvUploadService {
    constructor(prisma, dataMappingService, defaultsGenerator, fileParser) {
        this.prisma = prisma;
        this.dataMappingService = dataMappingService;
        this.defaultsGenerator = defaultsGenerator;
        this.fileParser = fileParser;
        this.logger = new common_1.Logger(CsvUploadService_1.name);
        this.sessions = new Map();
        this.SALES_HEADER_PATTERNS = [
            /customer.?name/i,
            /client.?name/i,
            /name/i,
            /contract.?number/i,
            /contract.?id/i,
            /address/i,
            /location/i,
            /mobile/i,
            /phone/i,
            /loan.?amount/i,
            /amount/i,
            /price/i,
            /total/i,
            /contract.?date/i,
            /date/i,
            /product/i,
            /item/i,
            /serial/i,
            /units/i,
            /quantity/i,
            /qty/i,
            /latitude/i,
            /lat/i,
            /longitude/i,
            /lng/i,
            /long/i,
            /gender/i,
            /sex/i,
        ];
        this.TRANSACTION_HEADER_PATTERNS = [
            /transaction.?id/i,
            /trans.?id/i,
            /payment.?id/i,
            /amount/i,
            /value/i,
            /sum/i,
            /reference/i,
            /ref/i,
            /receipt/i,
            /date/i,
            /time/i,
            /timestamp/i,
        ];
        setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000);
    }
    async validateFile(file) {
        try {
            this.logger.log(`Validating file: ${file.originalname}`);
            const sheets = await this.fileParser.parseFile(file);
            if (sheets.length === 0) {
                return {
                    isValid: false,
                    detectedTypes: [],
                    fileInfo: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                    },
                    sheetAnalysis: [],
                    errors: ['File contains no readable data'],
                    warnings: [],
                };
            }
            const sheetAnalysis = [];
            const detectedTypes = new Set();
            const errors = [];
            const warnings = [];
            for (const sheet of sheets) {
                const analysis = await this.analyzeSheet(sheet);
                sheetAnalysis.push(analysis);
                detectedTypes.add(analysis.dataType);
                if (analysis.missingFields.length > 0) {
                    warnings.push(`${sheet.sheetName}: Missing optional fields - ${analysis.missingFields.join(', ')}`);
                }
            }
            return {
                isValid: errors.length === 0,
                detectedTypes: Array.from(detectedTypes),
                fileInfo: {
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    sheets: sheets.map((s) => s.sheetName),
                },
                sheetAnalysis,
                errors,
                warnings,
            };
        }
        catch (error) {
            this.logger.error('Error validating file', error);
            throw new common_1.BadRequestException(`Failed to validate file: ${error.message}`);
        }
    }
    getMockDefaults() {
        return {
            categories: {
                product: {
                    id: 'mock-product-category',
                    name: 'Migrated Products',
                    type: 'PRODUCT',
                },
                inventory: {
                    id: 'mock-inventory-category',
                    name: 'Migrated Inventory',
                    type: 'INVENTORY',
                },
            },
            defaultUser: {
                id: 'mock-user',
                email: 'migration.agent@system.local',
                firstname: 'Migration',
                lastname: 'Agent',
            },
            inventoryCategories: [
                { id: 'mock-electronics', name: 'Electronics', type: 'INVENTORY' },
                { id: 'mock-solar', name: 'Solar Panels', type: 'INVENTORY' },
            ],
            defaultRole: { id: 'mock-role', role: 'Migration Agent' },
        };
    }
    async processFile(file, processCsvDto) {
        const sessionId = (0, uuid_1.v4)();
        this.logger.log(`Starting file processing session: ${sessionId}`);
        try {
            const sheets = await this.fileParser.parseFile(file);
            if (sheets.length === 0) {
                throw new common_1.BadRequestException('File contains no readable data');
            }
            let validation;
            if (!processCsvDto.skipValidation) {
                validation = await this.validateFile(file);
                if (!validation.isValid) {
                    throw new common_1.BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
                }
            }
            const generatedDefaults = await this.defaultsGenerator.generateDefaults();
            const session = await this.createProcessingSession(sessionId, file, sheets, generatedDefaults, processCsvDto.batchSize || 100);
            this.processSessionBatches(sessionId);
            return {
                sessionId,
                success: true,
                message: `File processing started. ${session.stats.totalRecords} records queued for processing across ${sheets.length} sheet(s).`,
                stats: session.stats,
            };
        }
        catch (error) {
            this.logger.error(`Error processing file in session ${sessionId}`, error);
            throw new common_1.BadRequestException(`Failed to process file: ${error.message}`);
        }
    }
    async processBatch(sessionId, batchIndex) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new common_1.BadRequestException('Session not found');
        }
        if (batchIndex >= session.batches.length) {
            throw new common_1.BadRequestException('Batch index out of range');
        }
        const batch = session.batches[batchIndex];
        await this.processBatchData(session, batch);
        return session.stats;
    }
    async getUploadStats(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new common_1.BadRequestException('Session not found');
        }
        return session.stats;
    }
    async cancelSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new common_1.BadRequestException('Session not found');
        }
        session.stats.status = 'cancelled';
        session.stats.endTime = new Date();
        this.logger.log(`Session ${sessionId} cancelled`);
        return {
            success: true,
            message: 'Session cancelled successfully',
            sessionId,
        };
    }
    async analyzeSheet(sheet) {
        const dataType = this.detectDataType(sheet.headers);
        const expectedFields = this.getExpectedFields(dataType);
        const missingFields = expectedFields.filter((field) => !sheet.headers.some((header) => this.matchesPattern(header, field)));
        return {
            sheetName: sheet.sheetName,
            dataType,
            totalRows: sheet.data.length,
            headers: sheet.headers,
            missingFields,
            sampleData: sheet.data.slice(0, 2),
        };
    }
    detectDataType(headers) {
        const salesScore = this.calculateMatchScore(headers, this.SALES_HEADER_PATTERNS);
        const transactionScore = this.calculateMatchScore(headers, this.TRANSACTION_HEADER_PATTERNS);
        if (salesScore > transactionScore && salesScore > 0.3) {
            return csv_upload_dto_1.CsvDataType.SALES;
        }
        else if (transactionScore > salesScore && transactionScore > 0.3) {
            return csv_upload_dto_1.CsvDataType.TRANSACTIONS;
        }
        else if (salesScore > 0.2 && transactionScore > 0.2) {
            return csv_upload_dto_1.CsvDataType.MIXED;
        }
        return csv_upload_dto_1.CsvDataType.AUTO_DETECT;
    }
    calculateMatchScore(headers, patterns) {
        let matches = 0;
        for (const header of headers) {
            for (const pattern of patterns) {
                if (pattern.test(header)) {
                    matches++;
                    break;
                }
            }
        }
        return headers.length > 0 ? matches / headers.length : 0;
    }
    matchesPattern(header, field) {
        return (header.toLowerCase().includes(field.toLowerCase()) ||
            field.toLowerCase().includes(header.toLowerCase()));
    }
    getExpectedFields(dataType) {
        switch (dataType) {
            case csv_upload_dto_1.CsvDataType.SALES:
                return ['customer', 'product', 'amount', 'phone'];
            case csv_upload_dto_1.CsvDataType.TRANSACTIONS:
                return ['transaction', 'amount', 'reference', 'date'];
            default:
                return [];
        }
    }
    async createProcessingSession(sessionId, file, sheets, generatedDefaults, batchSize) {
        const batches = [];
        let totalRecords = 0;
        const sheetBreakdown = [];
        for (const sheet of sheets) {
            const sheetBatches = [];
            for (let i = 0; i < sheet.data.length; i += batchSize) {
                const batchData = sheet.data.slice(i, i + batchSize);
                batches.push({
                    sheetName: sheet.sheetName,
                    batchIndex: sheetBatches.length,
                    data: batchData,
                });
                sheetBatches.push(batchData);
            }
            totalRecords += sheet.data.length;
            sheetBreakdown.push({
                sheetName: sheet.sheetName,
                dataType: sheet.dataType,
                total: sheet.data.length,
                processed: 0,
                errors: 0,
                created: {
                    customers: 0,
                    products: 0,
                    sales: 0,
                    transactions: 0,
                    contracts: 0,
                },
            });
        }
        const session = {
            id: sessionId,
            fileInfo: {
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
            },
            sheets,
            batches,
            generatedDefaults,
            stats: {
                sessionId,
                totalRecords,
                processedRecords: 0,
                errorRecords: 0,
                skippedRecords: 0,
                progressPercentage: 0,
                status: 'pending',
                breakdown: {
                    sheets: sheetBreakdown,
                },
                errors: [],
                startTime: new Date(),
            },
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    async processSessionBatches(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        session.stats.status = 'processing';
        try {
            for (let i = 0; i < session.batches.length; i++) {
                const currentSession = this.sessions.get(sessionId);
                if (!currentSession || currentSession.stats.status === 'cancelled') {
                    break;
                }
                const batch = session.batches[i];
                await this.processBatchData(session, batch);
                session.stats.progressPercentage = Math.round(((i + 1) / session.batches.length) * 100);
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            const finalSession = this.sessions.get(sessionId);
            if (finalSession) {
                if (finalSession.stats.status !== 'cancelled') {
                    finalSession.stats.status = 'completed';
                    finalSession.stats.endTime = new Date();
                }
            }
        }
        catch (error) {
            this.logger.error(`Error processing session ${sessionId}`, error);
            session.stats.status = 'failed';
            session.stats.endTime = new Date();
        }
    }
    async processBatchData(session, batch) {
        const sheet = session.sheets.find((s) => s.sheetName === batch.sheetName);
        if (!sheet)
            return;
        const sheetStats = session.stats.breakdown.sheets.find((s) => s.sheetName === batch.sheetName);
        if (!sheetStats)
            return;
        const salesSheet = session.sheets.find((s) => s.dataType === csv_upload_dto_1.CsvDataType.SALES ||
            s.sheetName.toLowerCase().includes('sales') ||
            s.sheetName.toLowerCase().includes('sale'));
        const transactionSheet = session.sheets.find((s) => s.dataType === csv_upload_dto_1.CsvDataType.TRANSACTIONS ||
            s.sheetName.toLowerCase().includes('transaction') ||
            s.sheetName.toLowerCase().includes('payment'));
        if (salesSheet &&
            transactionSheet &&
            sheet.sheetName === salesSheet.sheetName) {
            await this.processSynchronizedBatch(session, batch, salesSheet, transactionSheet);
        }
        else if (salesSheet &&
            transactionSheet &&
            sheet.sheetName === transactionSheet.sheetName) {
            this.logger.log(`Skipping transaction sheet ${sheet.sheetName} - processed with sales sheet`);
            return;
        }
        else {
            await this.processSingleSheetBatch(session, batch, sheet);
        }
    }
    async processSynchronizedBatch(session, salesBatch, salesSheet, transactionSheet) {
        const salesSheetStats = session.stats.breakdown.sheets.find((s) => s.sheetName === salesSheet.sheetName);
        const transactionSheetStats = session.stats.breakdown.sheets.find((s) => s.sheetName === transactionSheet.sheetName);
        if (!salesSheetStats || !transactionSheetStats)
            return;
        this.logger.log(`Processing synchronized batch: ${salesSheet.sheetName} + ${transactionSheet.sheetName}`);
        const batchStartIndex = salesBatch.batchIndex * salesBatch.data.length;
        for (let i = 0; i < salesBatch.data.length; i++) {
            const salesRow = salesBatch.data[i];
            const correspondingRowIndex = batchStartIndex + i;
            const transactionRow = transactionSheet.data[correspondingRowIndex];
            try {
                const salesResult = await this.processSalesRowWithImmediateTransaction(salesRow, transactionRow, session.generatedDefaults);
                salesSheetStats.processed++;
                session.stats.processedRecords++;
                if (salesResult.createdCustomer)
                    salesSheetStats.created.customers++;
                if (salesResult.createdProduct)
                    salesSheetStats.created.products++;
                if (salesResult.createdSale)
                    salesSheetStats.created.sales++;
                if (salesResult.createdContract)
                    salesSheetStats.created.contracts++;
                if (salesResult.processedTransaction && transactionRow) {
                    transactionSheetStats.processed++;
                    session.stats.processedRecords++;
                    if (salesResult.createdTransaction) {
                        transactionSheetStats.created.transactions++;
                    }
                }
                this.logger.debug(`Processed row ${correspondingRowIndex + 1}: Sales + Transaction`);
            }
            catch (error) {
                this.logger.error(`Error processing synchronized row ${correspondingRowIndex + 1}`, error);
                session.stats.errorRecords++;
                salesSheetStats.errors++;
                if (transactionRow) {
                    session.stats.errorRecords++;
                    transactionSheetStats.errors++;
                }
                session.stats.errors.push({
                    sheet: `${salesSheet.sheetName} + ${transactionSheet.sheetName}`,
                    row: correspondingRowIndex + 1,
                    field: 'general',
                    message: error.message,
                    data: { sales: salesRow, transaction: transactionRow },
                });
            }
        }
    }
    async processSalesRowWithImmediateTransaction(salesRow, transactionRow, generatedDefaults) {
        try {
            const transformedData = await this.dataMappingService.transformSalesRowToDatabase(salesRow, generatedDefaults);
            let createdCustomer = false;
            let createdSale = false;
            let createdContract = false;
            let customer = await this.prisma.customer.findFirst({
                where: {
                    OR: [
                        { phone: transformedData.customerData.phone },
                        { email: transformedData.customerData.email },
                    ],
                },
            });
            if (!customer) {
                customer = await this.prisma.customer.create({
                    data: transformedData.customerData,
                });
                createdCustomer = true;
                this.logger.debug(`Created new customer: ${customer.firstname} ${customer.lastname}`);
            }
            let contract = null;
            if (this.shouldCreateContract(salesRow)) {
                contract = await this.prisma.contract.create({
                    data: transformedData.contractData,
                });
                createdContract = true;
                this.logger.debug(`Created contract for customer: ${customer.firstname} ${customer.lastname}`);
            }
            const sale = await this.prisma.sales.create({
                data: {
                    ...transformedData.saleData,
                    customerId: customer.id,
                    contractId: contract?.id,
                },
            });
            createdSale = true;
            const saleItem = await this.prisma.saleItem.create({
                data: {
                    ...transformedData.saleItemData,
                    saleId: sale.id,
                    devices: transformedData.relatedEntities.device
                        ? {
                            connect: [{ id: transformedData.relatedEntities.device.id }],
                        }
                        : undefined,
                },
            });
            if (transformedData.relatedEntities.device) {
                await this.prisma.device.update({
                    where: { id: transformedData.relatedEntities.device.id },
                    data: {
                        isUsed: true,
                        saleItems: {
                            connect: [{ id: saleItem.id }],
                        },
                    },
                });
            }
            const existingProductInventory = await this.prisma.productInventory.findFirst({
                where: {
                    productId: transformedData.relatedEntities.product.id,
                    inventoryId: transformedData.relatedEntities.inventory.id,
                },
            });
            if (!existingProductInventory) {
                await this.prisma.productInventory.create({
                    data: {
                        productId: transformedData.relatedEntities.product.id,
                        inventoryId: transformedData.relatedEntities.inventory.id,
                        quantity: transformedData.saleItemData.quantity,
                    },
                });
            }
            let processedTransaction = false;
            let createdTransaction = false;
            if (transactionRow && this.isTransactionRow(transactionRow)) {
                try {
                    const transactionResult = await this.processTransactionRowWithSaleId(transactionRow, sale.id);
                    processedTransaction = true;
                    createdTransaction = transactionResult.createdTransaction;
                    this.logger.debug(`Processed corresponding transaction for sale ${sale.id}`);
                }
                catch (transactionError) {
                    this.logger.error(`Error processing corresponding transaction for sale ${sale.id}`, transactionError);
                }
            }
            return {
                createdCustomer,
                createdProduct: transformedData.relatedEntities.productCreated || false,
                createdSale,
                createdContract,
                processedTransaction,
                createdTransaction,
            };
        }
        catch (error) {
            this.logger.error(`Error processing sales row: ${error.message}`, error);
            throw error;
        }
    }
    async processTransactionRowWithSaleId(row, saleId) {
        try {
            const paymentData = await this.dataMappingService.transformTransactionToPayment(row, saleId);
            await this.prisma.sales.update({
                where: {
                    id: saleId,
                },
                data: {
                    transactionDate: paymentData.paymentDate,
                },
            });
            const existingPayment = await this.prisma.payment.findFirst({
                where: {
                    transactionRef: paymentData.transactionRef,
                    saleId: paymentData.saleId,
                },
            });
            if (existingPayment) {
                this.logger.warn(`Payment already exists for transaction: ${paymentData.transactionRef}`);
                return { createdTransaction: false };
            }
            await this.prisma.payment.create({
                data: paymentData,
            });
            await this.prisma.sales.update({
                where: { id: saleId },
                data: {
                    totalPaid: {
                        increment: paymentData.amount,
                    },
                },
            });
            this.logger.debug(`Successfully processed transaction: ${row.transactionId || row.reference}`);
            return { createdTransaction: true };
        }
        catch (error) {
            this.logger.error(`Error processing transaction row: ${error.message}`, error);
            throw error;
        }
    }
    async processSingleSheetBatch(session, batch, sheet) {
        const sheetStats = session.stats.breakdown.sheets.find((s) => s.sheetName === batch.sheetName);
        if (!sheetStats)
            return;
        for (const row of batch.data) {
            try {
                if (sheet.dataType === csv_upload_dto_1.CsvDataType.SALES ||
                    sheet.dataType === csv_upload_dto_1.CsvDataType.MIXED) {
                    if (this.isSalesRow(row)) {
                        const result = await this.processSalesRow(row, session.generatedDefaults);
                        sheetStats.processed++;
                        session.stats.processedRecords++;
                        if (result.createdCustomer)
                            sheetStats.created.customers++;
                        if (result.createdProduct)
                            sheetStats.created.products++;
                        if (result.createdSale)
                            sheetStats.created.sales++;
                        if (result.createdContract)
                            sheetStats.created.contracts++;
                    }
                }
                if (sheet.dataType === csv_upload_dto_1.CsvDataType.TRANSACTIONS ||
                    sheet.dataType === csv_upload_dto_1.CsvDataType.MIXED) {
                    if (this.isTransactionRow(row)) {
                        const result = await this.processTransactionRow(row);
                        sheetStats.processed++;
                        session.stats.processedRecords++;
                        if (result.createdTransaction)
                            sheetStats.created.transactions++;
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error processing row in ${batch.sheetName}`, error);
                session.stats.errorRecords++;
                sheetStats.errors++;
                session.stats.errors.push({
                    sheet: batch.sheetName,
                    row: sheetStats.processed + sheetStats.errors + 1,
                    field: 'general',
                    message: error.message,
                    data: row,
                });
            }
        }
    }
    isSalesRow(row) {
        const keys = Object.keys(row).map((k) => k.toLowerCase());
        return keys.some((key) => key.includes('customer') ||
            key.includes('client') ||
            key.includes('product') ||
            key.includes('name'));
    }
    isTransactionRow(row) {
        const keys = Object.keys(row).map((k) => k.toLowerCase());
        return keys.some((key) => key.includes('transaction') ||
            key.includes('payment') ||
            key.includes('reference') ||
            (key.includes('amount') &&
                (key.includes('id') || keys.some((k) => k.includes('ref')))));
    }
    async processSalesRow(row, generatedDefaults) {
        try {
            const transformedData = await this.dataMappingService.transformSalesRowToDatabase(row, generatedDefaults);
            let createdCustomer = false;
            let createdContract = false;
            let customer = await this.prisma.customer.findFirst({
                where: {
                    OR: [
                        { phone: transformedData.customerData.phone },
                        { email: transformedData.customerData.email },
                    ],
                },
            });
            if (!customer) {
                customer = await this.prisma.customer.create({
                    data: transformedData.customerData,
                });
                createdCustomer = true;
                this.logger.debug(`Created new customer: ${customer.firstname} ${customer.lastname}`);
            }
            let contract = null;
            if (this.shouldCreateContract(row)) {
                contract = await this.prisma.contract.create({
                    data: transformedData.contractData,
                });
                createdContract = true;
                this.logger.debug(`Created contract for customer: ${customer.firstname} ${customer.lastname}`);
            }
            const sale = await this.prisma.sales.create({
                data: {
                    ...transformedData.saleData,
                    customerId: customer.id,
                    contractId: contract?.id,
                },
            });
            const saleItem = await this.prisma.saleItem.create({
                data: {
                    ...transformedData.saleItemData,
                    saleId: sale.id,
                    devices: transformedData.relatedEntities.device
                        ? {
                            connect: [{ id: transformedData.relatedEntities.device.id }],
                        }
                        : undefined,
                },
            });
            if (transformedData.relatedEntities.device) {
                await this.prisma.device.update({
                    where: { id: transformedData.relatedEntities.device.id },
                    data: {
                        isUsed: true,
                        saleItems: {
                            connect: [{ id: saleItem.id }],
                        },
                    },
                });
            }
            const existingProductInventory = await this.prisma.productInventory.findFirst({
                where: {
                    productId: transformedData.relatedEntities.product.id,
                    inventoryId: transformedData.relatedEntities.inventory.id,
                },
            });
            if (!existingProductInventory) {
                await this.prisma.productInventory.create({
                    data: {
                        productId: transformedData.relatedEntities.product.id,
                        inventoryId: transformedData.relatedEntities.inventory.id,
                        quantity: transformedData.saleItemData.quantity,
                    },
                });
            }
            return {
                createdCustomer,
                createdProduct: transformedData.relatedEntities.productCreated || false,
                createdSale: sale,
                createdContract,
            };
        }
        catch (error) {
            this.logger.error(`Error processing sales row: ${error.message}`, error);
            throw error;
        }
    }
    async processTransactionRow(row) {
        try {
            const saleId = await this.findRelatedSaleId(row);
            if (!saleId) {
                this.logger.warn(`Could not find related sale for transaction: ${row.transactionId || row.reference}`);
                return { createdTransaction: false };
            }
            await this.createUnmatchedTransaction(row, saleId);
            const paymentData = await this.dataMappingService.transformTransactionToPayment(row, saleId);
            const existingPayment = await this.prisma.payment.findFirst({
                where: {
                    transactionRef: paymentData.transactionRef,
                    saleId: paymentData.saleId,
                },
            });
            if (existingPayment) {
                this.logger.warn(`Payment already exists for transaction: ${paymentData.transactionRef}`);
                return { createdTransaction: false };
            }
            await this.prisma.payment.create({
                data: paymentData,
            });
            await this.prisma.sales.update({
                where: { id: saleId },
                data: {
                    totalPaid: {
                        increment: paymentData.amount,
                    },
                },
            });
            this.logger.debug(`Successfully processed transaction: ${row.transactionId || row.reference}`);
            return { createdTransaction: true };
        }
        catch (error) {
            this.logger.error(`Error processing transaction row: ${error.message}`, error);
            throw error;
        }
    }
    shouldCreateContract(row) {
        const contractNumber = this.extractValue(row, [
            'contractNumber',
            'contract_number',
            'contractId',
        ]);
        const loanAmount = this.parseNumber(this.extractValue(row, ['LOAN_AMOUNT', 'loan_amount', 'amount', 'total']));
        return !!contractNumber || (loanAmount && loanAmount > 0);
    }
    extractValue(row, possibleKeys) {
        for (const key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key].toString();
            }
            const foundKey = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
            if (foundKey &&
                row[foundKey] !== undefined &&
                row[foundKey] !== null &&
                row[foundKey] !== '') {
                return row[foundKey].toString();
            }
        }
        return null;
    }
    parseNumber(value) {
        if (!value)
            return null;
        const cleaned = value.toString().replace(/[₦$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }
    async createUnmatchedTransaction(row, saleId) {
        try {
            const { transactionId, amount, reference, date } = this.dataMappingService.extractTransactionData(row);
            const orphanedTransaction = await this.prisma.orphanedTransaction.create({
                data: {
                    transactionId: transactionId || null,
                    amount: amount || 0,
                    reference: reference || null,
                    date: date || new Date(),
                    status: client_1.OrphanedTransactionStatus.NIL,
                    matchedSaleId: saleId || null,
                },
            });
            this.logger.warn(`Created orphaned transaction record: ${orphanedTransaction.id} for transaction: ${transactionId || reference || 'unknown'}`);
        }
        catch (error) {
            this.logger.error('Error creating orphaned transaction record', error.message || error);
        }
    }
    async findRelatedSaleId(row) {
        const amount = this.parseNumber(row.amount || '');
        const date = this.parseDate(row.date || '');
        const reference = row.reference || row.transactionId || '';
        if (reference) {
            const saleBySerial = await this.prisma.sales.findFirst({
                where: {
                    saleItems: {
                        some: {
                            devices: {
                                some: {
                                    serialNumber: {
                                        equals: reference.trim(),
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (saleBySerial) {
                await this.prisma.sales.update({
                    where: { id: saleBySerial.id },
                    data: { transactionDate: date },
                });
                return saleBySerial.id;
            }
        }
        if (!amount)
            return null;
        if (date) {
            const dateStart = new Date(date);
            dateStart.setDate(dateStart.getDate() - 7);
            const dateEnd = new Date(date);
            dateEnd.setDate(dateEnd.getDate() + 7);
            const sale = await this.prisma.sales.findFirst({
                where: {
                    totalPrice: amount,
                    createdAt: {
                        gte: dateStart,
                        lte: dateEnd,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (sale)
                return sale.id;
        }
        const saleByAmount = await this.prisma.sales.findFirst({
            where: {
                OR: [
                    { totalPrice: amount },
                    { totalMonthlyPayment: amount },
                ],
                status: {
                    in: ['IN_INSTALLMENT', 'UNPAID', 'COMPLETED'],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (saleByAmount)
            return saleByAmount.id;
        if (reference && reference.includes('-')) {
            const contractNumber = reference.split('-')[0];
            const saleWithContract = await this.prisma.sales.findFirst({
                where: {
                    contract: {
                        id: contractNumber,
                    },
                },
            });
            if (saleWithContract)
                return saleWithContract.id;
        }
        return null;
    }
    parseDate(dateString) {
        if (!dateString)
            return null;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                const formats = [
                    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                ];
                for (const format of formats) {
                    const match = dateString.match(format);
                    if (match) {
                        if (format === formats[1]) {
                            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                        }
                        else {
                            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
                        }
                    }
                }
                return null;
            }
            return date;
        }
        catch {
            return null;
        }
    }
    cleanupOldSessions() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.stats.startTime < oneHourAgo &&
                (session.stats.status === 'completed' ||
                    session.stats.status === 'failed')) {
                this.sessions.delete(sessionId);
                this.logger.log(`Cleaned up old session: ${sessionId}`);
            }
        }
    }
};
exports.CsvUploadService = CsvUploadService;
exports.CsvUploadService = CsvUploadService = CsvUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_mapping_service_1.DataMappingService,
        defaults_generator_service_1.DefaultsGeneratorService,
        file_parser_service_1.FileParserService])
], CsvUploadService);
//# sourceMappingURL=csv-upload.service.js.map