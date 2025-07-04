import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { FetchInventoryQueryDto } from './dto/fetch-inventory.dto';
import { CreateCategoryArrayDto } from './dto/create-category.dto';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createInventoryDto: CreateInventoryDto, requestUserId: string, file: Express.Multer.File): Promise<{
        message: string;
    }>;
    createInventoryBatch(requestUserId: string, createInventoryDto: CreateInventoryBatchDto): Promise<{
        message: string;
    }>;
    getInventories(query: FetchInventoryQueryDto): Promise<{
        inventories: import("./entity/inventory.entity").InventoryEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    getInventoryStats(): Promise<{
        inventoryClassCounts: {
            inventoryClass: import("@prisma/client").$Enums.InventoryClass;
            count: number;
        }[];
        totalInventoryCount: number;
        deletedInventoryCount: number;
    }>;
    getInventoryDetails(inventoryId: string): Promise<{
        inventoryCategory: import("../utils/entity/category").CategoryEntity;
        inventorySubCategory: import("../utils/entity/category").CategoryEntity;
        batches: import("./entity/inventory-batch.entity").InventoryBatchEntity[];
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
    getInventoryBatchDetails(inventoryId: string): Promise<import("./entity/inventory-batch.entity").InventoryBatchEntity>;
    createInventoryCategory(createCategoryArrayDto: CreateCategoryArrayDto): Promise<{
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
    getInventoryTabs(inventoryId: string): Promise<{
        name: string;
        url: string;
    }[]>;
}
