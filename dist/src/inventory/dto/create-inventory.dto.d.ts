import { InventoryClass } from '@prisma/client';
export declare class CreateInventoryDto {
    name: string;
    manufacturerName: string;
    dateOfManufacture?: string;
    sku?: string;
    costOfItem?: string;
    price: string;
    class: InventoryClass;
    numberOfStock: number;
    inventoryCategoryId: string;
    inventorySubCategoryId: string;
    inventoryImage: Express.Multer.File;
}
