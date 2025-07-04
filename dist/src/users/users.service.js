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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("./entity/user.entity");
const update_user_dto_1 = require("./dto/update-user.dto");
const constants_1 = require("../constants");
const class_validator_1 = require("class-validator");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async userFilter(query) {
        const { search, firstname, lastname, username, email, phone, location, status, isBlocked, roleId, createdAt, updatedAt, } = query;
        const filterConditions = {
            AND: [
                search
                    ? {
                        OR: [
                            { firstname: { contains: search, mode: 'insensitive' } },
                            { lastname: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                            { username: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                firstname
                    ? { firstname: { contains: firstname, mode: 'insensitive' } }
                    : {},
                lastname
                    ? { lastname: { contains: lastname, mode: 'insensitive' } }
                    : {},
                username
                    ? { username: { contains: username, mode: 'insensitive' } }
                    : {},
                email ? { email: { contains: email, mode: 'insensitive' } } : {},
                phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
                location
                    ? { location: { contains: location, mode: 'insensitive' } }
                    : {},
                status ? { status } : {},
                isBlocked !== undefined ? { isBlocked } : {},
                roleId ? { roleId } : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
            ],
        };
        return filterConditions;
    }
    async getUsers(query) {
        const { page = 1, limit = 100, sortField, sortOrder } = query;
        const filterConditions = await this.userFilter(query);
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const result = await this.prisma.user.findMany({
            skip,
            take,
            where: filterConditions,
            orderBy,
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        const users = (0, class_transformer_1.plainToInstance)(user_entity_1.UserEntity, result);
        const totalCount = await this.prisma.user.count({
            where: filterConditions,
        });
        return {
            users,
            total: totalCount,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async updateUser(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const validDto = (0, class_transformer_1.plainToInstance)(update_user_dto_1.UpdateUserDto, updateUserDto);
        await (0, class_validator_1.validateOrReject)(validDto);
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...validDto,
            },
        });
        return updatedUser;
    }
    async fetchUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const serialisedData = (0, class_transformer_1.plainToInstance)(update_user_dto_1.UpdateUserDto, user);
        return serialisedData;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return {
            message: constants_1.MESSAGES.DELETED,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map