import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@prisma/client';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductCategoryDto } from './dto/create-category.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(CreateProductDto: CreateProductDto, file: Express.Multer.File, id: string): Promise<{
        createdAt: Date;
        name: string;
        description: string | null;
        id: string;
        updatedAt: Date;
        image: string | null;
        creatorId: string | null;
        currency: string | null;
        paymentModes: string | null;
        categoryId: string;
    }>;
    getAllProducts(getProductsDto: GetProductsDto): Promise<{
        updatedResults: {
            inventories: {
                totalRemainingQuantities: number;
                totalInitialQuantities: number;
                productInventoryQuantity: number;
                inventoryCategory: {
                    createdAt: Date;
                    name: string;
                    type: import("@prisma/client").$Enums.CategoryTypes;
                    id: string;
                    updatedAt: Date;
                    parentId: string | null;
                };
                inventorySubCategory: {
                    createdAt: Date;
                    name: string;
                    type: import("@prisma/client").$Enums.CategoryTypes;
                    id: string;
                    updatedAt: Date;
                    parentId: string | null;
                };
                createdAt: Date;
                name: string;
                id: string;
                status: import("@prisma/client").$Enums.InventoryStatus;
                updatedAt: Date;
                deletedAt: Date | null;
                image: string | null;
                manufacturerName: string;
                dateOfManufacture: string | null;
                sku: string | null;
                class: import("@prisma/client").$Enums.InventoryClass;
                inventoryCategoryId: string | null;
                inventorySubCategoryId: string | null;
            }[];
            category: import("../utils/entity/category").CategoryEntity;
            priceRange: {
                minimumInventoryBatchPrice: string;
                maximumInventoryBatchPrice: string;
            };
            creatorDetails: {
                createdAt: Date;
                firstname: string | null;
                lastname: string | null;
                email: string;
                phone: string | null;
                location: string | null;
                id: string;
                username: string | null;
                password: string;
                addressType: import("@prisma/client").$Enums.AddressType | null;
                staffId: string | null;
                longitude: string | null;
                latitude: string | null;
                emailVerified: boolean;
                isBlocked: boolean;
                status: import("@prisma/client").$Enums.UserStatus;
                roleId: string;
                updatedAt: Date;
                deletedAt: Date | null;
                lastLogin: Date | null;
            };
            createdAt: Date;
            name: string;
            description: string | null;
            id: string;
            updatedAt: Date;
            image: string | null;
            creatorId: string | null;
            currency: string | null;
            paymentModes: string | null;
            categoryId: string;
        }[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    getProduct(id: string): Promise<Product>;
    createCategory(createCategoryDto: CreateProductCategoryDto): Promise<{
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryTypes;
        id: string;
        updatedAt: Date;
        parentId: string | null;
    }>;
    getAllCategories(): Promise<({
        parent: {
            createdAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CategoryTypes;
            id: string;
            updatedAt: Date;
            parentId: string | null;
        };
        children: {
            createdAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CategoryTypes;
            id: string;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryTypes;
        id: string;
        updatedAt: Date;
        parentId: string | null;
    })[]>;
    getInventoryTabs(productId: string): Promise<({
        name: string;
        url: string;
        count?: undefined;
    } | {
        name: string;
        url: string;
        count: number;
    })[]>;
    getProductInventory(productId: string): Promise<{
        inventories: ({
            inventory: {
                createdAt: Date;
                name: string;
                id: string;
                status: import("@prisma/client").$Enums.InventoryStatus;
                updatedAt: Date;
                deletedAt: Date | null;
                image: string | null;
                manufacturerName: string;
                dateOfManufacture: string | null;
                sku: string | null;
                class: import("@prisma/client").$Enums.InventoryClass;
                inventoryCategoryId: string | null;
                inventorySubCategoryId: string | null;
            };
        } & {
            id: string;
            inventoryId: string;
            quantity: number;
            productId: string;
        })[];
    } & {
        createdAt: Date;
        name: string;
        description: string | null;
        id: string;
        updatedAt: Date;
        image: string | null;
        creatorId: string | null;
        currency: string | null;
        paymentModes: string | null;
        categoryId: string;
    }>;
    getProductStatistics(): Promise<{
        allProducts: number;
    }>;
}
