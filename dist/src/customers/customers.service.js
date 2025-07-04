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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../users/entity/user.entity");
const helpers_util_1 = require("../utils/helpers.util");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCustomer(requestUserId, createCustomerDto) {
        const { longitude, latitude, email, ...rest } = createCustomerDto;
        const existingCustomer = await this.prisma.customer.findFirst({
            where: { email },
        });
        if (existingCustomer) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.EMAIL_EXISTS);
        }
        await this.prisma.customer.create({
            data: {
                email,
                creatorId: requestUserId,
                ...(longitude && { longitude }),
                ...(latitude && { latitude }),
                ...rest,
            },
        });
        return { message: constants_1.MESSAGES.CREATED };
    }
    async customerFilter(query) {
        const { search, firstname, lastname, email, phone, location, status, createdAt, updatedAt, isNew, } = query;
        const filterConditions = {
            AND: [
                search
                    ? {
                        OR: [
                            { firstname: { contains: search, mode: 'insensitive' } },
                            { lastname: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                firstname
                    ? { firstname: { contains: firstname, mode: 'insensitive' } }
                    : {},
                lastname
                    ? { lastname: { contains: lastname, mode: 'insensitive' } }
                    : {},
                email ? { email: { contains: email, mode: 'insensitive' } } : {},
                phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
                location
                    ? { location: { contains: location, mode: 'insensitive' } }
                    : {},
                status ? { status } : {},
                isNew
                    ? {
                        createdAt: {
                            gte: (0, helpers_util_1.getLastNDaysDate)(7),
                        },
                    }
                    : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
            ],
        };
        return filterConditions;
    }
    async getCustomers(query) {
        console.log({ query });
        const { page = 1, limit = 100, sortField, sortOrder } = query;
        const filterConditions = await this.customerFilter(query);
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const result = await this.prisma.customer.findMany({
            skip,
            take,
            where: {
                ...filterConditions,
            },
            orderBy,
        });
        const customers = (0, class_transformer_1.plainToInstance)(user_entity_1.UserEntity, result);
        const totalCount = await this.prisma.customer.count({
            where: filterConditions,
        });
        return {
            customers,
            total: totalCount,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async getCustomer(id) {
        const customer = await this.prisma.customer.findUnique({
            where: {
                id,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        return customer;
    }
    async deleteCustomer(id) {
        const user = await this.prisma.customer.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        await this.prisma.customer.delete({
            where: { id },
        });
        return {
            message: constants_1.MESSAGES.DELETED,
        };
    }
    async getCustomerStats() {
        const barredCustomerCount = await this.prisma.customer.count({
            where: {
                status: client_1.UserStatus.barred,
            },
        });
        const newCustomerCount = await this.prisma.customer.count({
            where: {
                createdAt: {
                    gte: (0, helpers_util_1.getLastNDaysDate)(7),
                },
            },
        });
        const activeCustomerCount = await this.prisma.customer.count({
            where: {
                status: client_1.UserStatus.active,
            },
        });
        const totalCustomerCount = await this.prisma.customer.count();
        return {
            barredCustomerCount,
            newCustomerCount,
            activeCustomerCount,
            totalCustomerCount,
        };
    }
    async getCustomerTabs(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: {
                id: customerId,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const tabs = [
            {
                name: 'Customer Details',
                url: `/customers/single/${customerId}`,
            },
            {
                name: 'RgistrationHistory',
                url: `/customers/${customerId}/registration-history`,
            },
            {
                name: 'Products',
                url: `/customers/${customerId}/products`,
            },
            {
                name: 'Contracts',
                url: `/customers/${customerId}/contracts`,
            },
            {
                name: 'Transactions',
                url: `/customers/${customerId}/transactions`,
            },
            {
                name: 'Tickets',
                url: `/customers/${customerId}/tickets`,
            },
        ];
        return tabs;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map