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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStatsRequestDto = exports.BatchProcessRequestDto = exports.TransactionsCsvRowDto = exports.SalesCsvRowDto = exports.CsvUploadResponseDto = exports.CsvUploadStatsDto = exports.ValidationResultDto = exports.ProcessCsvDto = exports.CsvFileUploadDto = exports.CsvDataType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var CsvDataType;
(function (CsvDataType) {
    CsvDataType["SALES"] = "sales";
    CsvDataType["TRANSACTIONS"] = "transactions";
    CsvDataType["MIXED"] = "mixed";
    CsvDataType["AUTO_DETECT"] = "auto_detect";
})(CsvDataType || (exports.CsvDataType = CsvDataType = {}));
class CsvFileUploadDto {
}
exports.CsvFileUploadDto = CsvFileUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'CSV or Excel file to upload (.csv, .xlsx, .xls)',
    }),
    __metadata("design:type", Object)
], CsvFileUploadDto.prototype, "file", void 0);
class ProcessCsvDto {
    constructor() {
        this.batchSize = 100;
        this.skipValidation = false;
    }
}
exports.ProcessCsvDto = ProcessCsvDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of records to process per batch',
        minimum: 10,
        maximum: 1000,
        default: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(1000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], ProcessCsvDto.prototype, "batchSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Skip validation if file was already validated',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], ProcessCsvDto.prototype, "skipValidation", void 0);
class ValidationResultDto {
}
exports.ValidationResultDto = ValidationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the file structure is valid' }),
    __metadata("design:type", Boolean)
], ValidationResultDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detected data types in the file' }),
    __metadata("design:type", Array)
], ValidationResultDto.prototype, "detectedTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File information' }),
    __metadata("design:type", Object)
], ValidationResultDto.prototype, "fileInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sheet analysis for each detected sheet' }),
    __metadata("design:type", Array)
], ValidationResultDto.prototype, "sheetAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall validation errors' }),
    __metadata("design:type", Array)
], ValidationResultDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall validation warnings' }),
    __metadata("design:type", Array)
], ValidationResultDto.prototype, "warnings", void 0);
class CsvUploadStatsDto {
}
exports.CsvUploadStatsDto = CsvUploadStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session identifier' }),
    __metadata("design:type", String)
], CsvUploadStatsDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records to process' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "totalRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of records successfully processed' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "processedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of records with errors' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "errorRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of records skipped' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "skippedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current processing progress (0-100)' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "progressPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Processing status',
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    }),
    __metadata("design:type", String)
], CsvUploadStatsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breakdown by data type and sheet' }),
    __metadata("design:type", Object)
], CsvUploadStatsDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing errors encountered' }),
    __metadata("design:type", Array)
], CsvUploadStatsDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing start time' }),
    __metadata("design:type", Date)
], CsvUploadStatsDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing end time' }),
    __metadata("design:type", Date)
], CsvUploadStatsDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated time remaining (in seconds)' }),
    __metadata("design:type", Number)
], CsvUploadStatsDto.prototype, "estimatedTimeRemaining", void 0);
class CsvUploadResponseDto {
}
exports.CsvUploadResponseDto = CsvUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session identifier' }),
    __metadata("design:type", String)
], CsvUploadResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the upload was successful' }),
    __metadata("design:type", Boolean)
], CsvUploadResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    __metadata("design:type", String)
], CsvUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload statistics' }),
    __metadata("design:type", CsvUploadStatsDto)
], CsvUploadResponseDto.prototype, "stats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Validation result (if validation was performed)',
    }),
    __metadata("design:type", ValidationResultDto)
], CsvUploadResponseDto.prototype, "validation", void 0);
class SalesCsvRowDto {
}
exports.SalesCsvRowDto = SalesCsvRowDto;
class TransactionsCsvRowDto {
}
exports.TransactionsCsvRowDto = TransactionsCsvRowDto;
class BatchProcessRequestDto {
}
exports.BatchProcessRequestDto = BatchProcessRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID to process' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchProcessRequestDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Specific batch index to process' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BatchProcessRequestDto.prototype, "batchIndex", void 0);
class SessionStatsRequestDto {
}
exports.SessionStatsRequestDto = SessionStatsRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID to get stats for' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionStatsRequestDto.prototype, "sessionId", void 0);
//# sourceMappingURL=csv-upload.dto.js.map