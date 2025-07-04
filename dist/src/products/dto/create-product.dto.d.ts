export declare class ProductInventoryDetailsDto {
    inventoryId: string;
    quantity: number;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    currency: string;
    paymentModes: string;
    categoryId: string;
    inventories: ProductInventoryDetailsDto[];
    productImage: Express.Multer.File;
}
