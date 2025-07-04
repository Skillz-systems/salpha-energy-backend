"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserService = void 0;
const common_1 = require("@nestjs/common");
const csvParser = require("csv-parser");
const XLSX = require("xlsx");
const stream_1 = require("stream");
const csv_upload_dto_1 = require("./dto/csv-upload.dto");
let FileParserService = FileParserService_1 = class FileParserService {
    constructor() {
        this.logger = new common_1.Logger(FileParserService_1.name);
    }
    async parseFile(file) {
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
        switch (fileExtension) {
            case '.csv':
                return await this.parseCsvFile(file.buffer);
            case '.xlsx':
            case '.xls':
                return await this.parseExcelFile(file.buffer);
            default:
                throw new Error(`Unsupported file type: ${fileExtension}`);
        }
    }
    async parseCsvFile(buffer) {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = stream_1.Readable.from(buffer.toString());
            stream
                .pipe(csvParser())
                .on('data', (data) => {
                const cleanedData = {};
                for (const [key, value] of Object.entries(data)) {
                    if (value !== null && value !== undefined && value !== '') {
                        cleanedData[key.trim()] =
                            typeof value === 'string' ? value.trim() : value;
                    }
                }
                if (Object.keys(cleanedData).length > 0) {
                    results.push(cleanedData);
                }
            })
                .on('end', () => {
                if (results.length === 0) {
                    resolve([]);
                    return;
                }
                const headers = Object.keys(results[0]);
                const dataType = this.detectDataTypeFromHeaders(headers);
                resolve([
                    {
                        sheetName: 'Sheet1',
                        dataType,
                        data: results,
                        headers,
                    },
                ]);
            })
                .on('error', (error) => {
                this.logger.error('Error parsing CSV file', error);
                reject(error);
            });
        });
    }
    async parseExcelFile(buffer) {
        try {
            const workbook = XLSX.read(buffer, {
                cellStyles: true,
                cellFormula: true,
                cellDates: true,
                cellNF: true,
                sheetStubs: false,
            });
            const sheets = [];
            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false,
                });
                if (jsonData.length === 0) {
                    this.logger.warn(`Sheet ${sheetName} is empty, skipping`);
                    continue;
                }
                const headers = jsonData[0]
                    .map((header, index) => header || `Column_${index + 1}`)
                    .map((header) => header.toString().trim())
                    .filter((header) => header !== '');
                if (headers.length === 0) {
                    this.logger.warn(`Sheet ${sheetName} has no valid headers, skipping`);
                    continue;
                }
                const objectData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: '',
                    blankrows: false,
                });
                const cleanedData = objectData
                    .map((row) => {
                    const cleanedRow = {};
                    let hasData = false;
                    for (const [key, value] of Object.entries(row)) {
                        if (value !== null && value !== undefined && value !== '') {
                            const cleanKey = key.toString().trim();
                            const cleanValue = typeof value === 'string' ? value.trim() : value;
                            if (cleanKey && cleanValue !== '') {
                                cleanedRow[cleanKey] = cleanValue;
                                hasData = true;
                            }
                        }
                    }
                    return hasData ? cleanedRow : null;
                })
                    .filter((row) => row !== null);
                if (cleanedData.length === 0) {
                    this.logger.warn(`Sheet ${sheetName} has no valid data after cleaning, skipping`);
                    continue;
                }
                const dataType = this.detectDataTypeFromHeaders(Object.keys(cleanedData[0]));
                sheets.push({
                    sheetName,
                    dataType,
                    data: cleanedData,
                    headers: Object.keys(cleanedData[0]),
                });
                this.logger.log(`Parsed sheet: ${sheetName} with ${cleanedData.length} rows`);
            }
            return sheets;
        }
        catch (error) {
            this.logger.error('Error parsing Excel file', error);
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
    }
    detectDataTypeFromHeaders(headers) {
        const salesPatterns = [
            /customer/i,
            /client/i,
            /name/i,
            /product/i,
            /item/i,
            /contract/i,
            /loan/i,
            /address/i,
            /phone/i,
            /mobile/i,
            /serial/i,
            /units/i,
            /quantity/i,
            /latitude/i,
            /longitude/i,
        ];
        const transactionPatterns = [
            /transaction/i,
            /payment/i,
            /amount/i,
            /reference/i,
            /receipt/i,
            /date/i,
            /time/i,
            /trans/i,
        ];
        const salesScore = this.calculatePatternScore(headers, salesPatterns);
        const transactionScore = this.calculatePatternScore(headers, transactionPatterns);
        this.logger.debug(`Header analysis - Sales score: ${salesScore}, Transaction score: ${transactionScore}`);
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
    calculatePatternScore(headers, patterns) {
        let matches = 0;
        const lowerHeaders = headers.map((h) => h.toLowerCase());
        for (const header of lowerHeaders) {
            for (const pattern of patterns) {
                if (pattern.test(header)) {
                    matches++;
                    break;
                }
            }
        }
        return headers.length > 0 ? matches / headers.length : 0;
    }
    normalizeHeader(header) {
        return header
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
    findBestHeaderMatch(targetField, availableHeaders) {
        const target = targetField.toLowerCase();
        const exactMatch = availableHeaders.find((h) => h.toLowerCase() === target);
        if (exactMatch)
            return exactMatch;
        const partialMatch = availableHeaders.find((h) => h.toLowerCase().includes(target) || target.includes(h.toLowerCase()));
        if (partialMatch)
            return partialMatch;
        const patterns = {
            customer_name: [/customer/i, /client/i, /name/i],
            phone: [/phone/i, /mobile/i, /cell/i, /contact/i],
            address: [/address/i, /location/i, /street/i],
            amount: [/amount/i, /price/i, /cost/i, /value/i, /total/i],
            product: [/product/i, /item/i, /service/i],
            date: [/date/i, /time/i, /when/i],
            reference: [/ref/i, /reference/i, /receipt/i, /id/i],
            transaction: [/transaction/i, /trans/i, /payment/i],
        };
        if (patterns[target]) {
            for (const header of availableHeaders) {
                for (const pattern of patterns[target]) {
                    if (pattern.test(header)) {
                        return header;
                    }
                }
            }
        }
        return null;
    }
};
exports.FileParserService = FileParserService;
exports.FileParserService = FileParserService = FileParserService_1 = __decorate([
    (0, common_1.Injectable)()
], FileParserService);
//# sourceMappingURL=file-parser.service.js.map