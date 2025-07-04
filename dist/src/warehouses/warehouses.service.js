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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const constants_1 = require("../constants");
let WarehousesService = class WarehousesService {
    constructor(cloudinary, prisma) {
        this.cloudinary = cloudinary;
        this.prisma = prisma;
    }
    async uploadInventoryImage(file) {
        return await this.cloudinary.uploadFile(file).catch((e) => {
            throw e;
        });
    }
    async create(createWarehouseDto, file) {
        const { name, type, inventoryClasses } = createWarehouseDto;
        const image = (await this.uploadInventoryImage(file)).secure_url;
        const warehouse = await this.prisma.warehouse.create({
            data: {
                name,
                type,
                inventoryClasses,
                image
            },
        });
        return warehouse;
    }
    async getAllWarehouses(getWarehousesDto) {
        const { page = 1, limit = 10, createdAt, updatedAt, sortField, sortOrder, search, } = getWarehousesDto;
        const whereConditions = {
            AND: [
                search
                    ? {
                        OR: [{ name: { contains: search, mode: 'insensitive' } }],
                    }
                    : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
            ],
        };
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const result = await this.prisma.warehouse.findMany({
            where: whereConditions,
            skip,
            take,
            orderBy,
        });
        const total = await this.prisma.warehouse.count({
            where: whereConditions,
        });
        const formattedResult = result.map((warehouse) => ({
            ...warehouse,
            total: 0,
        }));
        return {
            result: formattedResult,
            total,
            page,
            totalPages: limit === 0 ? 0 : Math.ceil(total / limit),
            limit,
        };
    }
    async getWarehouse(id) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id },
        });
        if (!warehouse) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.WAREHOUSE_NOT_FOUND);
        }
        return {
            ...warehouse,
            total: 0,
        };
    }
    async deactivateWarehouse(id) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id },
        });
        if (!warehouse) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.WAREHOUSE_NOT_FOUND);
        }
        if (warehouse.status === 'deactivated') {
            throw new common_1.ConflictException("Where already deactivated");
        }
        const updatedWarehouse = await this.prisma.warehouse.update({
            where: { id },
            data: { status: 'deactivated' },
        });
        return updatedWarehouse;
    }
    async getWarehouseStatistics() {
        const allWarehouses = await this.prisma.warehouse.count();
        if (!allWarehouses) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.WAREHOUSE_NOT_FOUND);
        }
        return {
            allWarehouses,
        };
    }
    update(id, updateWarehouseDto) {
        return `This action updates a #${id} warehouse`;
    }
    remove(id) {
        return `This action removes a #${id} warehouse`;
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map