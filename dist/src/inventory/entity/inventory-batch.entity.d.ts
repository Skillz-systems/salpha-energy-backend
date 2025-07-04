import { Inventory, User } from '@prisma/client';
export declare class InventoryBatchEntity implements Partial<Inventory> {
    costOfItem: number;
    price: number;
    pricbatchNumber: number;
    numberOfStock: number;
    remainingQuantity: number;
    creatorDetails: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    constructor(partial: Partial<InventoryBatchEntity>);
}
