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
exports.PasswordResetDTO = void 0;
const class_validator_1 = require("class-validator");
const passwordMatches_1 = require("../../auth/customValidators/passwordMatches");
const swagger_1 = require("@nestjs/swagger");
const class_validator_mongo_object_id_1 = require("class-validator-mongo-object-id");
class PasswordResetDTO {
}
exports.PasswordResetDTO = PasswordResetDTO;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'f9c2f4ef-6bfa-4434-9554-72774e507e1e',
        required: true,
        description: 'Valid reset token',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PasswordResetDTO.prototype, "resetToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '',
        required: true,
        description: 'A valid userId',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid User Id',
    }),
    __metadata("design:type", String)
], PasswordResetDTO.prototype, "userid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'beoioh0e202i/dlj',
        required: true,
        description: 'Valid new password',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], PasswordResetDTO.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'beoioh0e202i/dlj',
        required: true,
        description: 'New password confirmation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, passwordMatches_1.PasswordMatch)('newPassword'),
    __metadata("design:type", String)
], PasswordResetDTO.prototype, "confirmNewPassword", void 0);
//# sourceMappingURL=password-reset.dto.js.map