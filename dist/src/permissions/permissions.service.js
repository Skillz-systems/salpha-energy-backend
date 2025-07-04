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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const mongodb_1 = require("mongodb");
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isValidObjectId(id) {
        return mongodb_1.ObjectId.isValid(id);
    }
    async create(createPermissionDto) {
        const existingPermission = await this.prisma.permission.findFirst({
            where: {
                action: createPermissionDto.action,
                subject: createPermissionDto.subject,
            },
        });
        if (existingPermission) {
            throw new common_1.BadRequestException('Permission with the same action and subject already exists.');
        }
        return this.prisma.permission.create({
            data: {
                action: createPermissionDto.action,
                subject: createPermissionDto.subject,
            },
        });
    }
    async findAll() {
        return this.prisma.permission.findMany();
    }
    async findAllPermissionSubjects() {
        const hiddenSubjects = [client_1.SubjectEnum.all, client_1.SubjectEnum.User];
        const subjects = Object.values(client_1.SubjectEnum).filter((subject) => !hiddenSubjects.includes(subject));
        return { subjects };
    }
    async findOne(id) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid permission ID: ${id}`);
        }
        const existingPermission = await this.prisma.permission.findUnique({
            where: { id: String(id) },
        });
        if (!existingPermission) {
            throw new common_1.NotFoundException(`Permission with ID ${id} not found`);
        }
        return existingPermission;
    }
    async update(id, updatePermissionDto) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid permission ID: ${id}`);
        }
        const existingPermission = await this.prisma.permission.findUnique({
            where: { id: String(id) },
        });
        if (!existingPermission) {
            throw new common_1.NotFoundException(`Permission with ID ${id} not found`);
        }
        const updateData = {};
        if (updatePermissionDto.action) {
            updateData.action = updatePermissionDto.action;
        }
        if (updatePermissionDto.subject) {
            updateData.subject = updatePermissionDto.subject;
        }
        const updatedPermission = await this.prisma.permission.update({
            where: { id: String(id) },
            data: updateData,
        });
        return {
            message: `Permission with ID ${id} updated successfully`,
            data: updatedPermission,
        };
    }
    async remove(id) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid permission ID: ${id}`);
        }
        const existingPermission = await this.prisma.permission.findUnique({
            where: { id },
        });
        if (!existingPermission) {
            throw new common_1.NotFoundException(`Permission with ID ${id} not found`);
        }
        await this.prisma.permission.delete({
            where: { id },
        });
        return {
            message: 'Permission deleted successfully',
        };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map