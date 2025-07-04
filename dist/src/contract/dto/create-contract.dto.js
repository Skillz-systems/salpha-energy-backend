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
exports.GuarantorDto = exports.NextOfKinDto = exports.IdentificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class IdentificationDto {
}
exports.IdentificationDto = IdentificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of identification',
        enum: client_1.IDType,
        example: client_1.IDType.Nin,
    }),
    (0, class_validator_1.IsEnum)(client_1.IDType),
    __metadata("design:type", String)
], IdentificationDto.prototype, "idType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique number on the identification document',
        example: '123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "idNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country or authority that issued the identification document',
        example: 'Nigeria',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "issuingCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue date of the identification document (optional)',
        example: '1990-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expiration date of the identification document (optional)',
        example: '1990-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "expirationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name as shown on the identification document',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "fullNameAsOnID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address as shown on the identification document (optional)',
        example: '456 Elm Street, Abuja, Nigeria',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdentificationDto.prototype, "addressAsOnID", void 0);
class NextOfKinDto {
}
exports.NextOfKinDto = NextOfKinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The full name of the next of kin',
        example: 'Jane Doe',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Relationship between the user and the next of kin',
        example: 'Mother',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the next of kin',
        example: '+2341234567890',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the next of kin (optional)',
        example: 'jane.doe@example.com',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Home address of the next of kin (optional)',
        example: '123 Main Street, Lagos, Nigeria',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "homeAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth of the next of kin (optional)',
        example: '1990-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nationality of the next of kin (optional)',
        example: 'Nigeria',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NextOfKinDto.prototype, "nationality", void 0);
class GuarantorDto {
}
exports.GuarantorDto = GuarantorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The full name of the guarantor',
        example: 'John Smith',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the guarantor',
        example: '+2349876543210',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the guarantor (optional)',
        example: 'john.smith@example.com',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Home address of the guarantor',
        example: '789 Oak Avenue, Abuja, Nigeria',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "homeAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional gurantor identification details for customer.',
        type: IdentificationDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => IdentificationDto),
    __metadata("design:type", IdentificationDto)
], GuarantorDto.prototype, "identificationDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth of the guarantor (optional)',
        example: '1990-01-01T00:00:00.000Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nationality of the guarantor (optional)',
        example: 'Nigeria',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorDto.prototype, "nationality", void 0);
//# sourceMappingURL=create-contract.dto.js.map