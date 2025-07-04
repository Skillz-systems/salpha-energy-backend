import { UserStatus } from '@prisma/client';
export declare class ListCustomersQueryDto {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    location?: string;
    status?: UserStatus;
    createdAt?: string;
    updatedAt?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    page?: string;
    limit?: string;
    isNew?: boolean;
}
