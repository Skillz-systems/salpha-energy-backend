import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductCategoryDto } from './dto/create-category.dto';
import { CategoryEntity } from 'src/utils/entity/category';
export declare class ProductsService {
    private readonly cloudinary;
    private readonly prisma;
    constructor(cloudinary: CloudinaryService, prisma: PrismaService);
    uploadInventoryImage(file: Express.Multer.File): Promise<import("../cloudinary/cloudinary-response").CloudinaryResponse>;
    create(createProductDto: CreateProductDto, file: Express.Multer.File, creatorId: string): Promise<{
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
            category: CategoryEntity;
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
    getProduct(id: string): Promise<{
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
        category: CategoryEntity;
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
    }>;
    createProductCategory(createProductCategoryDto: CreateProductCategoryDto): Promise<{
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
    getProductTabs(productId: string): Promise<({
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
    private mapProductToResponseDto;
}
