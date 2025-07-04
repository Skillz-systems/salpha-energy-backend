import { InventoryClass } from '@prisma/client';
export declare class FetchInventoryQueryDto {
    inventoryCategoryId?: string;
    inventorySubCategoryId?: string;
    createdAt?: string;
    updatedAt?: string;
    class?: InventoryClass;
    search?: string;
    page?: string;
    limit?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}
