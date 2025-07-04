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
exports.CreateSalesDto = exports.SaleItemDto = exports.SaleRecipientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_mongo_object_id_1 = require("class-validator-mongo-object-id");
const create_contract_dto_1 = require("../../contract/dto/create-contract.dto");
const common_1 = require("@nestjs/common");
class SaleRecipientDto {
}
exports.SaleRecipientDto = SaleRecipientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Recipient's firstname.",
        example: 'John',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaleRecipientDto.prototype, "firstname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Recipient's lastname.",
        example: 'Doe',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaleRecipientDto.prototype, "lastname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Recipient's address.",
        example: '123 Street, City, Country',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaleRecipientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Recipient's phone number.",
        example: '+123456789',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaleRecipientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Recipient's email address.",
        example: 'john.doe@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SaleRecipientDto.prototype, "email", void 0);
class SaleItemDto {
}
exports.SaleItemDto = SaleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product ID linked to the sale item.',
        example: '507f191e810c19729de860ea',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid Product Id',
    }),
    __metadata("design:type", String)
], SaleItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity',
        example: '100',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('Quantity of sale product item must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment mode for this sale item.',
        enum: client_1.PaymentMode,
        example: 'INSTALLMENT',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMode),
    __metadata("design:type", String)
], SaleItemDto.prototype, "paymentMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Discount applied to this sale item in percentages.',
        example: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The duration of the installment in months (if installment is selected).',
        example: 6,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "installmentDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The starting price for installment payments.',
        example: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "installmentStartingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'An array of device IDs',
        example: ['value1', 'value2', 'value3'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid device Id',
        each: true,
    }),
    __metadata("design:type", Array)
], SaleItemDto.prototype, "devices", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Miscellaneous prices for this sale item.',
        example: '{"delivery": 20.5}',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaleItemDto.prototype, "miscellaneousPrices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient details for this sale item.',
        type: SaleRecipientDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SaleRecipientDto),
    __metadata("design:type", SaleRecipientDto)
], SaleItemDto.prototype, "saleRecipient", void 0);
class CreateSalesDto {
}
exports.CreateSalesDto = CreateSalesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category of the sale, such as "PRODUCT" or other predefined categories.',
        example: 'PRODUCT',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)([client_1.CategoryTypes.PRODUCT]),
    __metadata("design:type", String)
], CreateSalesDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer ID associated with this sale, should be a valid MongoDB ObjectId.',
        example: '605c72ef153207001f6480d',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid customer Id',
    }),
    __metadata("design:type", String)
], CreateSalesDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method for this sale.',
        enum: client_1.PaymentMethod,
        example: 'ONLINE',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", String)
], CreateSalesDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Customer's BVN (Bank Verification Number). Must be provided for if there is an installment payment",
        example: 1234567890,
    }),
    (0, class_validator_1.Length)(11, 11, {
        message: 'bvn must be exactly 11 characters',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesDto.prototype, "bvn", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether financial margins should be applied to this sale or not',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CreateSalesDto.prototype, "applyMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'An array of sale product items',
        type: [SaleItemDto],
        required: true,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaleItemDto),
    __metadata("design:type", Array)
], CreateSalesDto.prototype, "saleItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional Next of kin details for customer. Must be provided if payment mode is installment',
        type: create_contract_dto_1.NextOfKinDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_contract_dto_1.NextOfKinDto),
    __metadata("design:type", create_contract_dto_1.NextOfKinDto)
], CreateSalesDto.prototype, "nextOfKinDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional identification details for customer. Must be provided if payment mode is installment',
        type: create_contract_dto_1.IdentificationDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_contract_dto_1.IdentificationDto),
    __metadata("design:type", create_contract_dto_1.IdentificationDto)
], CreateSalesDto.prototype, "identificationDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional identification details for customer. Must be provided if payment mode is installment',
        type: create_contract_dto_1.GuarantorDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_contract_dto_1.GuarantorDto),
    __metadata("design:type", create_contract_dto_1.GuarantorDto)
], CreateSalesDto.prototype, "guarantorDetails", void 0);
//# sourceMappingURL=create-sales.dto.js.map