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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const csv_upload_service_1 = require("./csv-upload.service");
const csv_upload_dto_1 = require("./dto/csv-upload.dto");
let CsvUploadController = class CsvUploadController {
    constructor(csvUploadService) {
        this.csvUploadService = csvUploadService;
    }
    async validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
            throw new common_1.BadRequestException('Only CSV and Excel files are allowed (.csv, .xlsx, .xls)');
        }
        const maxSize = fileExtension === '.csv' ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }
        return await this.csvUploadService.validateFile(file);
    }
    async processFile(file, processCsvDto) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
            throw new common_1.BadRequestException('Only CSV and Excel files are allowed (.csv, .xlsx, .xls)');
        }
        const maxSize = fileExtension === '.csv' ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }
        return await this.csvUploadService.processFile(file, processCsvDto);
    }
    async processBatch(batchRequest) {
        return await this.csvUploadService.processBatch(batchRequest.sessionId, batchRequest.batchIndex);
    }
    async getUploadStats(statsRequest) {
        return await this.csvUploadService.getUploadStats(statsRequest.sessionId);
    }
    async cancelSession(cancelRequest) {
        return await this.csvUploadService.cancelSession(cancelRequest.sessionId);
    }
};
exports.CsvUploadController = CsvUploadController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate CSV/Excel file structure',
        description: 'Upload and validate file structure without processing data. Supports CSV and Excel files with multiple sheets.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'File to validate',
        type: csv_upload_dto_1.CsvFileUploadDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Validation result with auto-detected structure and generated defaults',
        type: csv_upload_dto_1.ValidationResultDto,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvUploadController.prototype, "validateFile", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Process and import data from CSV/Excel file',
        description: 'Upload and process file with automatic data transformation, default value generation, and intelligent batch import. All missing required fields are automatically handled.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'File to process with optional processing parameters',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'CSV or Excel file to process',
                },
                batchSize: {
                    type: 'integer',
                    minimum: 10,
                    maximum: 1000,
                    default: 100,
                    description: 'Number of records to process per batch',
                },
                skipValidation: {
                    type: 'boolean',
                    default: false,
                    description: 'Skip validation if already validated',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File processing started with session tracking',
        type: csv_upload_dto_1.CsvUploadResponseDto,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, csv_upload_dto_1.ProcessCsvDto]),
    __metadata("design:returntype", Promise)
], CsvUploadController.prototype, "processFile", null);
__decorate([
    (0, common_1.Post)('process-batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process specific batch of validated data',
        description: 'Process a specific batch of pre-validated data from an ongoing session',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Batch processing request',
        type: csv_upload_dto_1.BatchProcessRequestDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch processing result',
        type: csv_upload_dto_1.CsvUploadStatsDto,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [csv_upload_dto_1.BatchProcessRequestDto]),
    __metadata("design:returntype", Promise)
], CsvUploadController.prototype, "processBatch", null);
__decorate([
    (0, common_1.Post)('get-upload-stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get upload session statistics',
        description: 'Retrieve detailed statistics for an ongoing upload session including progress, errors, and created records',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Session stats request',
        type: csv_upload_dto_1.SessionStatsRequestDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed upload statistics',
        type: csv_upload_dto_1.CsvUploadStatsDto,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [csv_upload_dto_1.SessionStatsRequestDto]),
    __metadata("design:returntype", Promise)
], CsvUploadController.prototype, "getUploadStats", null);
__decorate([
    (0, common_1.Post)('cancel-session'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel an ongoing upload session',
        description: 'Cancel processing for a specific session and cleanup resources',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Session to cancel',
        type: csv_upload_dto_1.SessionStatsRequestDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session cancellation result',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                sessionId: { type: 'string' },
            },
        },
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [csv_upload_dto_1.SessionStatsRequestDto]),
    __metadata("design:returntype", Promise)
], CsvUploadController.prototype, "cancelSession", null);
exports.CsvUploadController = CsvUploadController = __decorate([
    (0, swagger_1.ApiTags)('CSV Data Migration'),
    (0, common_1.Controller)('csv-upload'),
    __metadata("design:paramtypes", [csv_upload_service_1.CsvUploadService])
], CsvUploadController);
//# sourceMappingURL=csv-upload.controller.js.map