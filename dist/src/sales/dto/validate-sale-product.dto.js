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
exports.ValidateSaleProductDto = exports.ValidateSaleProductItemDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_mongo_object_id_1 = require("class-validator-mongo-object-id");
class ValidateSaleProductItemDto {
}
exports.ValidateSaleProductItemDto = ValidateSaleProductItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product ID linked to the sale item.',
        example: '507f191e810c19729de860ea',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid Id',
    }),
    __metadata("design:type", String)
], ValidateSaleProductItemDto.prototype, "productId", void 0);
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
], ValidateSaleProductItemDto.prototype, "quantity", void 0);
class ValidateSaleProductDto {
}
exports.ValidateSaleProductDto = ValidateSaleProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'An array of product items to be validated againt inventory quantities',
        type: [ValidateSaleProductItemDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ValidateSaleProductItemDto),
    __metadata("design:type", Array)
], ValidateSaleProductDto.prototype, "productItems", void 0);
//# sourceMappingURL=validate-sale-product.dto.js.map