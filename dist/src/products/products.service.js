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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const constants_1 = require("../constants");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const category_1 = require("../utils/entity/category");
let ProductsService = class ProductsService {
    constructor(cloudinary, prisma) {
        this.cloudinary = cloudinary;
        this.prisma = prisma;
    }
    async uploadInventoryImage(file) {
        return await this.cloudinary.uploadFile(file).catch((e) => {
            throw e;
        });
    }
    async create(createProductDto, file, creatorId) {
        const { name, description, currency, paymentModes, categoryId, inventories, } = createProductDto;
        const isCategoryValid = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                type: client_1.CategoryTypes.PRODUCT,
            },
        });
        if (!isCategoryValid) {
            throw new common_1.BadRequestException('Invalid Product Category');
        }
        const productInventoryIds = inventories?.map((ivt) => ivt.inventoryId);
        if (productInventoryIds.length === 0) {
            throw new common_1.BadRequestException('No inventory IDs provided.');
        }
        const inventoriesFromDb = await this.prisma.inventory.findMany({
            where: {
                id: {
                    in: productInventoryIds,
                },
            },
            select: {
                id: true,
            },
        });
        const validInventoryIds = new Set(inventoriesFromDb.map((inventory) => inventory.id));
        const invalidInventoryIds = productInventoryIds.filter((id) => !validInventoryIds.has(id));
        if (invalidInventoryIds.length > 0) {
            throw new common_1.BadRequestException(`Invalid inventory IDs: ${invalidInventoryIds.join(', ')}`);
        }
        const image = (await this.uploadInventoryImage(file)).secure_url;
        const product = await this.prisma.product.create({
            data: {
                name,
                description,
                image,
                currency,
                paymentModes,
                categoryId,
                creatorId,
            },
        });
        await this.prisma.productInventory.createMany({
            data: inventories?.map(({ inventoryId, quantity }) => ({
                productId: product.id,
                inventoryId,
                quantity,
            })),
        });
        return product;
    }
    async getAllProducts(getProductsDto) {
        const { page = 1, limit = 10, categoryId, createdAt, updatedAt, sortField, sortOrder, search, } = getProductsDto;
        const whereConditions = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                categoryId ? { categoryId } : {},
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
        const result = await this.prisma.product.findMany({
            where: whereConditions,
            skip,
            take,
            orderBy,
            include: {
                category: true,
                creatorDetails: true,
                inventories: {
                    include: {
                        inventory: {
                            include: { batches: true },
                        },
                    },
                },
            },
        });
        const updatedResults = result.map(this.mapProductToResponseDto);
        const total = await this.prisma.product.count({
            where: whereConditions,
        });
        return {
            updatedResults,
            total,
            page,
            totalPages: limit === 0 ? 0 : Math.ceil(total / limit),
            limit,
        };
    }
    async getProduct(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                creatorDetails: true,
                inventories: {
                    include: {
                        inventory: {
                            include: { batches: true },
                        },
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.PRODUCT_NOT_FOUND);
        }
        return this.mapProductToResponseDto(product);
    }
    async createProductCategory(createProductCategoryDto) {
        const { name } = createProductCategoryDto;
        const categoryExists = await this.prisma.category.findFirst({
            where: {
                name,
                type: client_1.CategoryTypes.PRODUCT,
            },
        });
        if (categoryExists) {
            throw new common_1.ConflictException(`A product category with this name: ${name} already exists`);
        }
        return this.prisma.category.create({
            data: {
                name,
                type: client_1.CategoryTypes.PRODUCT,
            },
        });
    }
    async getAllCategories() {
        return await this.prisma.category.findMany({
            where: {
                type: client_1.CategoryTypes.PRODUCT,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async getProductTabs(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: {
                _count: {
                    select: { customers: true },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.PRODUCT_NOT_FOUND);
        }
        const tabs = [
            {
                name: 'Product Details',
                url: `/product/${productId}/details`,
            },
            {
                name: 'Stats',
                url: `/product/${productId}/stats`,
            },
            {
                name: 'Inventory Details',
                url: `/product/${productId}/inventory`,
            },
            {
                name: 'Customers',
                url: `/product/${productId}/customers`,
                count: product._count.customers,
            },
        ];
        return tabs;
    }
    async getProductInventory(productId) {
        const inventoryBatch = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                inventories: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
        if (!inventoryBatch) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.PRODUCT_NOT_FOUND);
        }
        return inventoryBatch;
    }
    async getProductStatistics() {
        const allProducts = await this.prisma.product.count();
        if (!allProducts) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.PRODUCT_NOT_FOUND);
        }
        return {
            allProducts,
        };
    }
    mapProductToResponseDto(product) {
        const { inventories, category, ...rest } = product;
        const { maximumInventoryBatchPrice, minimumInventoryBatchPrice } = inventories
            .map(({ quantity, inventory }) => {
            const { batches } = inventory;
            const batchPrices = batches
                .filter(({ remainingQuantity }) => remainingQuantity > 0)
                .map((batch) => batch.price * quantity);
            return {
                minimumInventoryBatchPrice: batchPrices.length
                    ? Math.min(...batchPrices)
                    : 0.0,
                maximumInventoryBatchPrice: batchPrices.length
                    ? Math.max(...batchPrices)
                    : 0.0,
            };
        })
            .reduce((prev, curr) => {
            prev.minimumInventoryBatchPrice += curr.minimumInventoryBatchPrice;
            prev.maximumInventoryBatchPrice += curr.maximumInventoryBatchPrice;
            return prev;
        }, {
            minimumInventoryBatchPrice: 0,
            maximumInventoryBatchPrice: 0,
        });
        const priceRange = {
            minimumInventoryBatchPrice: minimumInventoryBatchPrice.toFixed(2),
            maximumInventoryBatchPrice: maximumInventoryBatchPrice.toFixed(2),
        };
        return {
            ...rest,
            inventories: inventories.map(({ quantity, inventory }) => {
                const { batches, ...rest } = inventory;
                const totalRemainingQuantities = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
                const totalInitialQuantities = batches.reduce((sum, batch) => sum + batch.numberOfStock, 0);
                return {
                    ...rest,
                    totalRemainingQuantities,
                    totalInitialQuantities,
                    productInventoryQuantity: quantity
                };
            }),
            category: (0, class_transformer_1.plainToInstance)(category_1.CategoryEntity, category),
            priceRange,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map