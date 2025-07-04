export declare class CreateSubCategoryDto {
    name: string;
}
export declare class CreateCategoryDto {
    name: string;
    parentId: string;
    subCategories?: CreateSubCategoryDto[];
}
export declare class CreateCategoryArrayDto {
    categories: CreateCategoryDto[];
}
