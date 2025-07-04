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
exports.UpdatePermissionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UpdatePermissionDto {
}
exports.UpdatePermissionDto = UpdatePermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The updated action type that defines the permission (e.g., manage, read, write, delete).',
        example: client_1.ActionEnum.manage,
        enum: client_1.ActionEnum,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.ActionEnum, { message: 'Invalid action type' }),
    __metadata("design:type", String)
], UpdatePermissionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The updated subject to which the action applies (e.g., User, TempToken, or all).',
        example: client_1.SubjectEnum.Customers,
        enum: client_1.SubjectEnum,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.SubjectEnum, { message: 'Invalid subject' }),
    __metadata("design:type", String)
], UpdatePermissionDto.prototype, "subject", void 0);
//# sourceMappingURL=update-permission.dto.js.map