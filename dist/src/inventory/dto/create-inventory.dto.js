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
exports.CreateInventoryDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateInventoryDto {
}
exports.CreateInventoryDto = CreateInventoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory Name',
        example: 'Inventory 1',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of Manufacturer',
        example: 'Manufacturer 1',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "manufacturerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Manufacture Date',
        example: '',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "dateOfManufacture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inventory Sku',
        example: 'TXUNE989',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cost of item',
        example: '',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('Cost Of Item must be a valid number.');
        }
        return parsedValue;
    }),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "costOfItem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price of item (NGN)',
        example: 'bduob',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('Price must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.InventoryClass,
        example: '',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.InventoryClass),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of Stock',
        example: '100',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('Number of stock must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateInventoryDto.prototype, "numberOfStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category Id',
        example: '',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "inventoryCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sub Category Id',
        example: '',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "inventorySubCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'file' }),
    __metadata("design:type", Object)
], CreateInventoryDto.prototype, "inventoryImage", void 0);
//# sourceMappingURL=create-inventory.dto.js.map