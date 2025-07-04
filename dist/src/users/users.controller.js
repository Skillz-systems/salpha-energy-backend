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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./entity/user.entity");
const throttler_1 = require("@nestjs/throttler");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const update_user_dto_1 = require("./dto/update-user.dto");
const constants_1 = require("../constants");
const list_users_dto_1 = require("./dto/list-users.dto");
const getUser_1 = require("../auth/decorators/getUser");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async listUsers(query) {
        return await this.usersService.getUsers(query);
    }
    async updateUser(id, updateUserDto) {
        if (Object.keys(updateUserDto).length === 0) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.EMPTY_OBJECT);
        }
        return new user_entity_1.UserEntity(await this.usersService.updateUser(id, updateUserDto));
    }
    async superUserUpdateUser(id, updateUserDto) {
        if (Object.keys(updateUserDto).length === 0) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.EMPTY_OBJECT);
        }
        return new user_entity_1.UserEntity(await this.usersService.updateUser(id, updateUserDto));
    }
    async fetchUser(id) {
        return new user_entity_1.UserEntity(await this.usersService.fetchUser(id));
    }
    async superUserFetchUser(id) {
        return new user_entity_1.UserEntity(await this.usersService.fetchUser(id));
    }
    async deleteUser(id) {
        return await this.usersService.deleteUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        description: 'List all users with pagination',
        type: user_entity_1.UserEntity,
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(list_users_dto_1.ListUsersQueryDto),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_users_dto_1.ListUsersQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user details',
        description: 'This endpoint allows authenticated users to update their details. The userId for the user is derived from the JWT token provided in the Authorization header.',
    }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User profile updated successfully',
        type: user_entity_1.UserEntity,
    }),
    __param(0, (0, getUser_1.GetSessionUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user details by superuser',
        description: 'This endpoint allows superusers to update user details.',
    }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User profile updated successfully',
        type: user_entity_1.UserEntity,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "superUserUpdateUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/single'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch user details',
        description: 'This endpoint allows an authenticated user to fetch their details.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        type: user_entity_1.UserEntity,
    }),
    __param(0, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "fetchUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: "User's id to fetch details",
    }),
    (0, common_1.Get)('single/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch user details by superuser',
        description: 'This endpoint allows a permitted user fetch a user details.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        type: user_entity_1.UserEntity,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "superUserFetchUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: "User's id",
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete user by superuser',
        description: 'This endpoint allows a permitted user to delete a user.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        type: user_entity_1.UserEntity,
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map