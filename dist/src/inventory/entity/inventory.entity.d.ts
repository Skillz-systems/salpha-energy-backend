import { Inventory, InventoryClass, InventoryStatus } from '@prisma/client';
export declare class InventoryEntity implements Partial<Inventory> {
    id: string;
    name: string;
    manufacturerName: string;
    sku: string;
    image: string;
    dateOfManufacture: string;
    batchNumber: number;
    status: InventoryStatus;
    class: InventoryClass;
    inventoryCategory: string;
    inventorySubCategory: string;
    batches: Array<any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    constructor(partial: Partial<InventoryEntity>);
}
