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
exports.CreateUserPasswordParamsDto = exports.CreateUserPasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants");
const passwordMatches_1 = require("../customValidators/passwordMatches");
const class_validator_mongo_object_id_1 = require("class-validator-mongo-object-id");
class CreateUserPasswordDto {
}
exports.CreateUserPasswordDto = CreateUserPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'new-password',
        required: true,
        description: 'password of new user',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, { message: constants_1.MESSAGES.PASSWORD_TOO_WEAK }),
    __metadata("design:type", String)
], CreateUserPasswordDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'new-password-confirmation',
        required: true,
        description: 'password confirmation of user',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, passwordMatches_1.PasswordMatch)('password'),
    __metadata("design:type", String)
], CreateUserPasswordDto.prototype, "confirmPassword", void 0);
class CreateUserPasswordParamsDto {
}
exports.CreateUserPasswordParamsDto = CreateUserPasswordParamsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_mongo_object_id_1.IsObjectId)({
        message: 'Invalid User Id',
    }),
    __metadata("design:type", String)
], CreateUserPasswordParamsDto.prototype, "userid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserPasswordParamsDto.prototype, "token", void 0);
//# sourceMappingURL=create-user-password.dto.js.map