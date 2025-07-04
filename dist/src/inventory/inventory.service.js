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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const prisma_service_1 = require("../prisma/prisma.service");
const constants_1 = require("../constants");
const client_1 = require("@prisma/client");
const inventory_entity_1 = require("./entity/inventory.entity");
const class_transformer_1 = require("class-transformer");
const inventory_batch_entity_1 = require("./entity/inventory-batch.entity");
const category_1 = require("../utils/entity/category");
let InventoryService = class InventoryService {
    constructor(cloudinary, prisma) {
        this.cloudinary = cloudinary;
        this.prisma = prisma;
    }
    async inventoryFilter(query) {
        const { search, inventoryCategoryId, inventorySubCategoryId, createdAt, updatedAt, class: inventoryClass, } = query;
        const filterConditions = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { manufacturerName: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                inventoryCategoryId ? { inventoryCategoryId } : {},
                inventorySubCategoryId ? { inventorySubCategoryId } : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
                inventoryClass ? { class: inventoryClass } : {},
            ],
        };
        return filterConditions;
    }
    async uploadInventoryImage(file) {
        return await this.cloudinary.uploadFile(file).catch((e) => {
            throw e;
        });
    }
    async createInventory(requestUserId, createInventoryDto, file) {
        const { inventorySubCategoryId, inventoryCategoryId } = createInventoryDto;
        const isCategoryValid = await this.prisma.category.findFirst({
            where: {
                id: inventoryCategoryId,
                children: {
                    some: {
                        id: inventorySubCategoryId,
                        type: client_1.CategoryTypes.INVENTORY,
                    },
                },
                type: client_1.CategoryTypes.INVENTORY,
            },
        });
        if (!isCategoryValid) {
            throw new common_1.BadRequestException('Invalid inventorySubCategoryId or inventoryCategoryId');
        }
        const image = (await this.uploadInventoryImage(file)).secure_url;
        const inventoryData = await this.prisma.inventory.create({
            data: {
                name: createInventoryDto.name,
                manufacturerName: createInventoryDto.manufacturerName,
                dateOfManufacture: createInventoryDto.dateOfManufacture,
                sku: createInventoryDto.sku,
                image,
                class: createInventoryDto.class,
                inventoryCategoryId: createInventoryDto.inventoryCategoryId,
                inventorySubCategoryId: createInventoryDto.inventorySubCategoryId,
            },
        });
        await this.prisma.inventoryBatch.create({
            data: {
                creatorId: requestUserId,
                inventoryId: inventoryData.id,
                batchNumber: Date.now() - 100,
                costOfItem: parseFloat(createInventoryDto.costOfItem),
                price: parseFloat(createInventoryDto.price),
                numberOfStock: createInventoryDto.numberOfStock,
                remainingQuantity: createInventoryDto.numberOfStock,
            },
        });
        return {
            message: constants_1.MESSAGES.INVENTORY_CREATED,
        };
    }
    async createInventoryBatch(requestUserId, createInventoryBatchDto) {
        const isInventoryValid = await this.prisma.inventory.findFirst({
            where: {
                id: createInventoryBatchDto.inventoryId,
            },
        });
        if (!isInventoryValid) {
            throw new common_1.BadRequestException('Invalid inventoryId');
        }
        await this.prisma.inventoryBatch.create({
            data: {
                creatorId: requestUserId,
                batchNumber: Date.now() - 100,
                inventoryId: createInventoryBatchDto.inventoryId,
                costOfItem: parseFloat(createInventoryBatchDto.costOfItem),
                price: parseFloat(createInventoryBatchDto.price),
                numberOfStock: createInventoryBatchDto.numberOfStock,
                remainingQuantity: createInventoryBatchDto.numberOfStock,
            },
        });
        return {
            message: constants_1.MESSAGES.INVENTORY_CREATED,
        };
    }
    async getInventories(query) {
        const { page = 1, limit = 100, sortField, sortOrder, inventoryCategoryId, inventorySubCategoryId, } = query;
        if (inventoryCategoryId || inventorySubCategoryId) {
            const categoryIds = [inventoryCategoryId, inventorySubCategoryId].filter(Boolean);
            const isCategoryValid = await this.prisma.category.findFirst({
                where: {
                    id: {
                        in: categoryIds,
                    },
                    type: client_1.CategoryTypes.INVENTORY,
                },
            });
            if (!isCategoryValid) {
                throw new common_1.BadRequestException('Invalid inventorySubCategoryId or inventoryCategoryId');
            }
        }
        const filterConditions = await this.inventoryFilter(query);
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const result = await this.prisma.inventory.findMany({
            skip,
            take,
            where: filterConditions,
            orderBy,
            include: {
                batches: {
                    include: {
                        creatorDetails: {
                            select: {
                                firstname: true,
                                lastname: true,
                            },
                        },
                    },
                },
                inventoryCategory: true,
                inventorySubCategory: true,
            },
        });
        const updatedResults = result.map(this.mapInventoryToResponseDto);
        const totalCount = await this.prisma.inventory.count({
            where: filterConditions,
        });
        return {
            inventories: (0, class_transformer_1.plainToInstance)(inventory_entity_1.InventoryEntity, updatedResults),
            total: totalCount,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async getInventory(inventoryId) {
        const inventory = await this.prisma.inventory.findUnique({
            where: { id: inventoryId },
            include: {
                batches: {
                    include: {
                        creatorDetails: {
                            select: {
                                firstname: true,
                                lastname: true,
                            },
                        },
                    },
                },
                inventoryCategory: true,
                inventorySubCategory: true,
            },
        });
        if (!inventory) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.INVENTORY_NOT_FOUND);
        }
        return this.mapInventoryToResponseDto(inventory);
    }
    async getInventoryBatch(inventoryBatchId) {
        const inventorybatch = await this.prisma.inventoryBatch.findUnique({
            where: { id: inventoryBatchId },
            include: {
                inventory: true,
            },
        });
        if (!inventorybatch) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.BATCH_NOT_FOUND);
        }
        return (0, class_transformer_1.plainToInstance)(inventory_batch_entity_1.InventoryBatchEntity, {
            ...inventorybatch,
            inventory: (0, class_transformer_1.plainToInstance)(inventory_entity_1.InventoryEntity, inventorybatch.inventory),
        });
    }
    async createInventoryCategory(categories) {
        for (const category of categories) {
            const { name, subCategories, parentId } = category;
            const existingCategoryByName = await this.prisma.category.findFirst({
                where: { name, type: client_1.CategoryTypes.INVENTORY },
            });
            if (existingCategoryByName) {
                throw new common_1.ConflictException(`An inventory category with this name: ${name} already exists`);
            }
            if (parentId) {
                const existingParentCategory = await this.prisma.category.findFirst({
                    where: { id: parentId },
                });
                if (!existingParentCategory) {
                    throw new common_1.BadRequestException('Invalid Parent Id');
                }
            }
            await this.prisma.category.create({
                data: {
                    name,
                    ...(parentId ? { parentId } : {}),
                    type: client_1.CategoryTypes.INVENTORY,
                    children: {
                        create: subCategories?.map((subCat) => ({
                            name: subCat.name,
                            type: client_1.CategoryTypes.INVENTORY,
                        })),
                    },
                },
            });
        }
        return { message: constants_1.MESSAGES.CREATED };
    }
    async getInventoryCategories() {
        return await this.prisma.category.findMany({
            where: {
                type: client_1.CategoryTypes.INVENTORY,
                parent: null,
            },
            include: {
                children: true,
            },
        });
    }
    async getInventoryStats() {
        const inventoryClassCounts = await this.prisma.inventory.groupBy({
            by: ['class'],
            _count: {
                class: true,
            },
        });
        const transformedClassCounts = inventoryClassCounts.map((item) => ({
            inventoryClass: item.class,
            count: item._count.class,
        }));
        const totalInventoryCount = await this.prisma.inventory.count();
        const deletedInventoryCount = await this.prisma.inventory.count({
            where: {
                deletedAt: {
                    not: null,
                },
            },
        });
        return {
            inventoryClassCounts: transformedClassCounts,
            totalInventoryCount,
            deletedInventoryCount,
        };
    }
    async getInventoryTabs(inventoryId) {
        const inventory = await this.prisma.inventory.findUnique({
            where: { id: inventoryId },
        });
        if (!inventory)
            throw new common_1.NotFoundException(constants_1.MESSAGES.INVENTORY_NOT_FOUND);
        const tabs = [
            {
                name: 'Details',
                url: `/inventory/${inventoryId}`,
            },
            {
                name: 'History',
                url: `/inventory/${inventoryId}/history`,
            },
            {
                name: 'Stats',
                url: `/inventory/${inventoryId}/stats`,
            },
        ];
        return tabs;
    }
    mapInventoryToResponseDto(inventory) {
        const { batches, inventoryCategory, inventorySubCategory, ...rest } = inventory;
        const salePrice = {
            minimumInventoryBatchPrice: 0,
            maximumInventoryBatchPrice: 0,
        };
        if (batches.length) {
            const batchPrices = batches
                .filter(({ remainingQuantity }) => remainingQuantity > 0)
                .map((batch) => batch.price);
            const minimumInventoryBatchPrice = Math.floor(Math.min(...batchPrices));
            const maximumInventoryBatchPrice = Math.ceil(Math.max(...batchPrices));
            salePrice.minimumInventoryBatchPrice = minimumInventoryBatchPrice;
            salePrice.maximumInventoryBatchPrice = maximumInventoryBatchPrice;
        }
        const inventoryValue = batches.reduce((sum, batch) => sum + batch.remainingQuantity * batch.price, 0);
        const totalRemainingQuantities = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
        const totalInitialQuantities = batches.reduce((sum, batch) => sum + batch.numberOfStock, 0);
        const updatedBatches = batches.map((batch) => ({
            ...batch,
            stockValue: (batch.remainingQuantity * batch.price).toFixed(2),
        }));
        return {
            ...rest,
            inventoryCategory: (0, class_transformer_1.plainToInstance)(category_1.CategoryEntity, inventoryCategory),
            inventorySubCategory: (0, class_transformer_1.plainToInstance)(category_1.CategoryEntity, inventorySubCategory),
            batches: (0, class_transformer_1.plainToInstance)(inventory_batch_entity_1.InventoryBatchEntity, updatedBatches),
            salePrice,
            inventoryValue,
            totalRemainingQuantities,
            totalInitialQuantities,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map