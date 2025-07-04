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
exports.CreateFinancialMarginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
class CreateFinancialMarginDto {
}
exports.CreateFinancialMarginDto = CreateFinancialMarginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Percentage value of the outrightMargin in float ',
        example: '0.5',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('outrightMargin must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateFinancialMarginDto.prototype, "outrightMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Percentage value of the loanMargin in float ',
        example: '0.5',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('loanMargin must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateFinancialMarginDto.prototype, "loanMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Percentage value of the monthlyInterest in float ',
        example: '0.5',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            throw new common_1.BadRequestException('monthlyInterest must be a valid number.');
        }
        return parsedValue;
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateFinancialMarginDto.prototype, "monthlyInterest", void 0);
//# sourceMappingURL=create-financial-margins.dto.js.map