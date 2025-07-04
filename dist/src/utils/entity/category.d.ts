import { Category, CategoryTypes } from '@prisma/client';
export declare class CategoryEntity implements Partial<Category> {
    id: string;
    parentId: string;
    type: CategoryTypes;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    constructor(partial: Partial<CategoryEntity>);
}
