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
exports.CreateProductDto = exports.ProductInventoryDetailsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_validator_mongo_object_id_1 = require("class-validator-mongo-object-id");
const class_transformer_1 = require("class-transformer");
const common_1 = require("@nestjs/common");
class ProductInventoryDetailsDto {
}
exports.ProductInventoryDetailsDto = ProductInventoryDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory ID.',
        example: '507f191e810c19729de860ea',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid Inventory Id',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        console.log({ value });
        if (typeof value === 'object' && value.inventoryId) {
            return value.inventoryId;
        }
        return value;
    }),
    __metadata("design:type", String)
], ProductInventoryDetailsDto.prototype, "inventoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity',
        example: '100',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('Quantity must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ProductInventoryDetailsDto.prototype, "quantity", void 0);
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ description: 'Name of the product' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional description of the product' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({
        default: 'NGN',
        description: 'Currency of the product',
    }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Payment modes for the product. The distinct payment modes should be concatenated together and separated by comma',
    }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "paymentModes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid Product Category',
    }),
    (0, swagger_1.ApiProperty)({ description: 'Product category Id of the product' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'An array of inventory details for this product.',
        type: ProductInventoryDetailsDto,
        required: true,
        isArray: true,
        default: [
            {
                inventoryId: '6745ba5dfe24f6583d4e5d3b',
                quantity: 100,
            },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            if (!Array.isArray(parsedValue)) {
                throw new Error('Value must be an array');
            }
            return parsedValue;
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid format for inventories array');
        }
    }),
    (0, class_transformer_1.Type)(() => ProductInventoryDetailsDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "inventories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'file', description: 'Product image file' }),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "productImage", void 0);
//# sourceMappingURL=create-product.dto.js.map