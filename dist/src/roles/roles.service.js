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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const mongodb_1 = require("mongodb");
const class_transformer_1 = require("class-transformer");
const roles_entity_1 = require("./entity/roles.entity");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isValidObjectId(id) {
        return mongodb_1.ObjectId.isValid(id);
    }
    async create(createRoleDto, id) {
        const { role, active, permissionIds } = createRoleDto;
        const existingRole = await this.prisma.role.findUnique({
            where: { role },
        });
        if (existingRole) {
            throw new common_1.ConflictException(`Role with name ${role} already exists`);
        }
        if (permissionIds &&
            permissionIds.some((id) => !this.isValidObjectId(id))) {
            throw new common_1.BadRequestException(`One or more permission IDs are invalid`);
        }
        return this.prisma.role.create({
            data: {
                role,
                active,
                permissions: {
                    connect: permissionIds?.map((id) => ({ id })),
                },
                creator: {
                    connect: { id: id },
                },
            },
        });
    }
    async findAll() {
        const result = await this.prisma.role.findMany({
            include: {
                permissions: {
                    select: {
                        id: true,
                        action: true,
                        subject: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
                creator: true,
            },
        });
        const roles = (0, class_transformer_1.plainToInstance)(roles_entity_1.RolesEntity, result);
        return roles;
    }
    async findOne(id) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid ID: ${id}`);
        }
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: true },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with id ${id} not found`);
        }
        return role;
    }
    async update(id, updateRoleDto) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid ID: ${id}`);
        }
        const { role, active, permissionIds } = updateRoleDto;
        if (permissionIds &&
            permissionIds.some((id) => !this.isValidObjectId(id))) {
            throw new common_1.BadRequestException(`One or more permission IDs are invalid`);
        }
        const data = {};
        if (role !== undefined)
            data.role = role;
        if (active !== undefined)
            data.active = active;
        if (permissionIds !== undefined) {
            data.permissions = {
                set: [],
                connect: permissionIds.map((id) => ({ id })),
            };
        }
        if (role !== undefined) {
            const existingRole = await this.prisma.role.findFirst({
                where: {
                    role,
                    NOT: { id },
                },
            });
            if (existingRole) {
                throw new common_1.ConflictException(`Role with name ${role} already exists`);
            }
        }
        try {
            return await this.prisma.role.update({
                where: { id },
                data,
                include: { permissions: true },
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Role with id ${id} not found`);
                }
            }
            console.log({ error });
            throw new common_1.InternalServerErrorException('An unexpected error occurred');
        }
    }
    async remove(id) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid ID: ${id}`);
        }
        try {
            const role = await this.prisma.role.delete({
                where: { id },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with id ${id} not found`);
            }
            return role;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Role with id ${id} not found`);
                }
            }
            throw new common_1.InternalServerErrorException('An unexpected error occurred');
        }
    }
    async assignUserToRole(id, assignUserToRoleDto) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid user ID: ${id}`);
        }
        const { roleId } = assignUserToRoleDto;
        if (roleId && !this.isValidObjectId(roleId)) {
            throw new common_1.BadRequestException(`Invalid role ID: ${roleId}`);
        }
        const roleExists = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!roleExists) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                role: { connect: { id: roleId } },
            },
        });
        return {
            message: 'This user has been assigned to a role successfully',
        };
    }
    async getRoleWithUsersAndPermissions(roleId) {
        if (!this.isValidObjectId(roleId)) {
            throw new common_1.BadRequestException(`Invalid role ID: ${roleId}`);
        }
        return this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                users: true,
                permissions: true,
            },
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map