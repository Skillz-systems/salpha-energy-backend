import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FetchInventoryQueryDto } from './dto/fetch-inventory.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { InventoryEntity } from './entity/inventory.entity';
import { InventoryBatchEntity } from './entity/inventory-batch.entity';
import { CategoryEntity } from '../utils/entity/category';
export declare class InventoryService {
    private readonly cloudinary;
    private readonly prisma;
    constructor(cloudinary: CloudinaryService, prisma: PrismaService);
    inventoryFilter(query: FetchInventoryQueryDto): Promise<Prisma.InventoryWhereInput>;
    uploadInventoryImage(file: Express.Multer.File): Promise<import("../cloudinary/cloudinary-response").CloudinaryResponse>;
    createInventory(requestUserId: string, createInventoryDto: CreateInventoryDto, file: Express.Multer.File): Promise<{
        message: string;
    }>;
    createInventoryBatch(requestUserId: string, createInventoryBatchDto: CreateInventoryBatchDto): Promise<{
        message: string;
    }>;
    getInventories(query: FetchInventoryQueryDto): Promise<{
        inventories: InventoryEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    getInventory(inventoryId: string): Promise<{
        inventoryCategory: CategoryEntity;
        inventorySubCategory: CategoryEntity;
        batches: InventoryBatchEntity[];
        salePrice: {
            minimumInventoryBatchPrice: number;
            maximumInventoryBatchPrice: number;
        };
        inventoryValue: number;
        totalRemainingQuantities: number;
        totalInitialQuantities: number;
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
    }>;
    getInventoryBatch(inventoryBatchId: string): Promise<InventoryBatchEntity>;
    createInventoryCategory(categories: CreateCategoryDto[]): Promise<{
        message: string;
    }>;
    getInventoryCategories(): Promise<({
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
    getInventoryStats(): Promise<{
        inventoryClassCounts: {
            inventoryClass: import("@prisma/client").$Enums.InventoryClass;
            count: number;
        }[];
        totalInventoryCount: number;
        deletedInventoryCount: number;
    }>;
    getInventoryTabs(inventoryId: string): Promise<{
        name: string;
        url: string;
    }[]>;
    mapInventoryToResponseDto(inventory: Prisma.InventoryGetPayload<{
        include: {
            inventoryCategory: true;
            inventorySubCategory: true;
            batches: {
                include: {
                    creatorDetails: {
                        select: {
                            firstname: true;
                            lastname: true;
                        };
                    };
                };
            };
        };
    }>): {
        inventoryCategory: CategoryEntity;
        inventorySubCategory: CategoryEntity;
        batches: InventoryBatchEntity[];
        salePrice: {
            minimumInventoryBatchPrice: number;
            maximumInventoryBatchPrice: number;
        };
        inventoryValue: number;
        totalRemainingQuantities: number;
        totalInitialQuantities: number;
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
}
