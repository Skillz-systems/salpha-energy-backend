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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entity/user.entity");
const create_user_dto_1 = require("./dto/create-user.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const password_reset_dto_1 = require("./dto/password-reset.dto");
const login_user_dto_1 = require("./dto/login-user.dto");
const throttler_1 = require("@nestjs/throttler");
const class_transformer_1 = require("class-transformer");
const create_super_user_dto_1 = require("./dto/create-super-user.dto");
const jwt_guard_1 = require("./guards/jwt.guard");
const roles_guard_1 = require("./guards/roles.guard");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("./decorators/roles.decorator");
const create_user_password_dto_1 = require("./dto/create-user-password.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const getUser_1 = require("./decorators/getUser");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async addUser(registerUserDto) {
        const newUser = await this.authService.addUser(registerUserDto);
        return (0, class_transformer_1.plainToClass)(user_entity_1.UserEntity, newUser);
    }
    async createSuperuser(registerUserDto) {
        const newUser = await this.authService.createSuperuser(registerUserDto);
        return (0, class_transformer_1.plainToClass)(user_entity_1.UserEntity, newUser);
    }
    async login(userDetails, res) {
        return this.authService.login(userDetails, res);
    }
    forgotPassword(forgotPasswordDetails) {
        return this.authService.forgotPassword(forgotPasswordDetails);
    }
    async verifyResetToken(params) {
        return await this.authService.verifyToken(params.token, client_1.TokenType.password_reset, params.userid);
    }
    async verifyEmailVerficationToken(params) {
        return await this.authService.verifyToken(params.token, client_1.TokenType.email_verification, params.userid);
    }
    createUserPassword(body, params) {
        return this.authService.createUserPassword(body, params);
    }
    changePassword(body, userId) {
        return this.authService.changePassword(body, userId);
    }
    resetPassword(resetPasswordDetails) {
        return this.authService.resetPassword(resetPasswordDetails);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, common_1.Post)('add-user'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiCreatedResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, swagger_1.ApiBody)({
        type: create_user_dto_1.CreateUserDto,
        description: 'Json structure for request payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('create-superuser'),
    (0, swagger_1.ApiCreatedResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiForbiddenResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, swagger_1.ApiBody)({
        type: create_super_user_dto_1.CreateSuperUserDto,
        description: 'Json structure for request payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_super_user_dto_1.CreateSuperUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createSuperuser", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ default: false }),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiUnauthorizedResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, swagger_1.ApiBody)({
        type: login_user_dto_1.LoginUserDTO,
        description: 'Json structure for request payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDTO, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, swagger_1.ApiBody)({
        type: forgot_password_dto_1.ForgotPasswordDTO,
        description: 'Json structure for request payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDTO]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-reset-token/:userid/:token'),
    (0, swagger_1.ApiParam)({
        name: 'userid',
        description: 'userid of user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'token',
        description: 'The token used for password reset verification',
        type: String,
    }),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_password_dto_1.CreateUserPasswordParamsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetToken", null);
__decorate([
    (0, common_1.Post)('verify-email-verification-token/:userid/:token'),
    (0, swagger_1.ApiParam)({
        name: 'userid',
        description: 'userid of user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'token',
        description: 'The token used for email verification',
        type: String,
    }),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_password_dto_1.CreateUserPasswordParamsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailVerficationToken", null);
__decorate([
    (0, common_1.Post)('create-user-password/:userid/:token'),
    (0, swagger_1.ApiParam)({
        name: 'userid',
        description: 'userid of the new user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'token',
        description: 'valid password creation token',
    }),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_password_dto_1.CreateUserPasswordDto,
        create_user_password_dto_1.CreateUserPasswordParamsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createUserPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiInternalServerErrorResponse)({}),
    (0, swagger_1.ApiBody)({
        type: password_reset_dto_1.PasswordResetDTO,
        description: 'Json structure for request payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetDTO]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map