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
exports.CreateSuperUserDto = void 0;
const class_validator_1 = require("class-validator");
const passwordRelated_1 = require("../customValidators/passwordRelated");
const constants_1 = require("../../constants");
const swagger_1 = require("@nestjs/swagger");
class CreateSuperUserDto {
}
exports.CreateSuperUserDto = CreateSuperUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'john',
        required: true,
        description: 'Firstname of super user',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSuperUserDto.prototype, "firstname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'john',
        required: true,
        description: 'Lastname of super user',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSuperUserDto.prototype, "lastname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'testuser@gmail.com',
        required: true,
        description: 'Email of super user',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateSuperUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '09yu2408h0wnh89h20',
        required: true,
        description: 'super user key creation key',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSuperUserDto.prototype, "cKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'new-user-password',
        required: true,
        description: 'password of super user',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, passwordRelated_1.PasswordRelated)(['email', 'firstname', 'lastname'], {
        message: `{type: ['email', 'firstname', 'lastname'], error: 'Password must not be similar to your email, first name, or last name'}`,
    }),
    (0, class_validator_1.MinLength)(8, { message: constants_1.MESSAGES.PASSWORD_TOO_WEAK }),
    __metadata("design:type", String)
], CreateSuperUserDto.prototype, "password", void 0);
//# sourceMappingURL=create-super-user.dto.js.map