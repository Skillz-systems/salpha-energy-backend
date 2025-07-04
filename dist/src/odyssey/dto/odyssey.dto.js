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
exports.TokenResponseDto = exports.GenerateTokenDto = exports.OdysseyPaymentQueryDto = exports.OdysseyPaymentResponseDto = exports.OdysseyPaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OdysseyPaymentDto {
}
exports.OdysseyPaymentDto = OdysseyPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time of payment in UTC timezone using ISO 8601 format',
        example: '2021-05-16T14:16:01.350Z',
        format: 'date-time',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount of transaction',
        example: 5000,
        type: 'number',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OdysseyPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The currency of the transaction',
        example: 'Naira',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of transaction',
        enum: [
            'FULL_PAYMENT',
            'INSTALLMENT_PAYMENT',
            'NON_CONTRACT_PAYMENT',
            'DISCOUNT',
            'REVERSAL',
            'ENERGY_CREDIT',
        ],
        example: 'FULL_PAYMENT',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'An ID unique to the transaction',
        example: 'managepayments.com-transaction-001',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The serial number of the SHS device. Returns "N/A" if not available.',
        example: '001A-001-1234',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The serial number of the SHS device. Returns "N/A" if not available.',
        example: '001A-001-1234',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "meterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The customer ID of the user of the device',
        example: 'customer-565',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Name of the user of the device',
        example: 'Example SHS Customer 1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone number of the user of the device',
        example: '+234 0814 731 5678',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category of the customer who uses the device',
        example: 'Residential',
        enum: ['Public', 'Prepaid', 'Residential', 'Commercial', 'Business'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "customerCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID specific to the financing provider or program',
        example: 'REA_NEP_OBF',
        enum: ['REA_NEP_PBG', 'REA_NEP_OBF', 'BRILHO_SHS', 'UEF_SSPU'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "financingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The agent facilitating the transaction',
        example: 'managepayments.com-agent-001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Latitude of the location of the device',
        example: '6.465422',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Longitude of the location of the device',
        example: '3.406448',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'A unique ID for utility',
        example: '4676739',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentDto.prototype, "utilityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of instances where batteries fail to reach capacity limit',
        example: 0,
        type: 'number',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OdysseyPaymentDto.prototype, "failedBatteryCapacityCount", void 0);
class OdysseyPaymentResponseDto {
}
exports.OdysseyPaymentResponseDto = OdysseyPaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of payment records',
        type: [OdysseyPaymentDto],
    }),
    __metadata("design:type", Array)
], OdysseyPaymentResponseDto.prototype, "payments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of any errors explaining the lack of results',
        example: '',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentResponseDto.prototype, "errors", void 0);
class OdysseyPaymentQueryDto {
}
exports.OdysseyPaymentQueryDto = OdysseyPaymentQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start of date range (ISO 8601 format in UTC)',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], OdysseyPaymentQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End of date range (ISO 8601 format in UTC)',
        example: '2024-01-02T00:00:00.000Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], OdysseyPaymentQueryDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional financing program ID filter',
        example: 'REA_NEP_OBF',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentQueryDto.prototype, "financingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional site ID filter',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentQueryDto.prototype, "siteId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional country filter',
        example: 'NG',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OdysseyPaymentQueryDto.prototype, "country", void 0);
class GenerateTokenDto {
}
exports.GenerateTokenDto = GenerateTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the client for whom the token is being generated',
        example: 'SHS Global Nigeria',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateTokenDto.prototype, "clientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of days until token expires (default: 365)',
        example: 365,
        minimum: 1,
        maximum: 3650,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateTokenDto.prototype, "expirationDays", void 0);
class TokenResponseDto {
}
exports.TokenResponseDto = TokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Generated API token',
        example: 'e25080c723345c3bbd0095f21a4f9efa808051a99c33a085415258535',
    }),
    __metadata("design:type", String)
], TokenResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client name',
        example: 'SHS Global Nigeria',
    }),
    __metadata("design:type", String)
], TokenResponseDto.prototype, "clientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token expiration date',
        example: '2025-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], TokenResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token creation date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], TokenResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=odyssey.dto.js.map