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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles.service");
const swagger_1 = require("@nestjs/swagger");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const assign_user_dto_1 = require("./dto/assign-user.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const getUser_1 = require("../auth/decorators/getUser");
let RolesController = class RolesController {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async create(createRoleDto, id) {
        try {
            return await this.roleService.create(createRoleDto, id);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error creating role');
        }
    }
    async findAll() {
        try {
            return await this.roleService.findAll();
        }
        catch (error) {
            console.log({ error });
            throw new common_1.InternalServerErrorException('Error retrieving roles');
        }
    }
    async findOne(id) {
        const role = await this.roleService.findOne(id);
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async update(id, updateRoleDto) {
        try {
            return await this.roleService.update(id, updateRoleDto);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error updating role');
        }
    }
    async remove(id) {
        const deletedRole = await this.roleService.remove(id);
        if (!deletedRole) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return { message: 'Role deleted successfully' };
    }
    async assignUserToRole(id, assignUserToRoleDto) {
        const result = await this.roleService.assignUserToRole(id, assignUserToRoleDto);
        if (!result) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found or user not found`);
        }
        return { message: 'User assigned to role successfully' };
    }
    async getRole(roleId) {
        const roleDetails = await this.roleService.getRoleWithUsersAndPermissions(roleId);
        if (!roleDetails) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        return roleDetails;
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Role created successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request. Role already exists or invalid input.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_role_dto_1.CreateRoleDto,
        description: 'Data for creating a new role',
        examples: {
            example1: {
                summary: 'Example of a role creation',
                value: {
                    role: 'Admin',
                    active: true,
                    permissionIds: ['permId1', 'permId2'],
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto, String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all roles with permissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Roles retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a role by ID with permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Role ID to retrieve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a role' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the role to update' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiBody)({
        type: update_role_dto_1.UpdateRoleDto,
        description: 'Data for updating a role',
        examples: {
            example1: {
                summary: 'Example of a role update',
                value: {
                    role: 'Manager',
                    active: false,
                    permissionIds: ['perm1', 'perm3'],
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a role by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the role to delete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Post)('/:id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a user to a role' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the user to assign the role to' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User assigned to role successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role or user not found' }),
    (0, swagger_1.ApiBody)({
        type: assign_user_dto_1.AssignUserToRoleDto,
        description: 'Data for assigning a user to a role',
        examples: {
            example1: {
                summary: 'Assigning a role to a user',
                value: { roleId: 'role1' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_user_dto_1.AssignUserToRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "assignUserToRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.User}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.Get)('/more_details/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a role with users and permissions by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Role ID to retrieve with users and permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role with users and permissions retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getRole", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles'),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map