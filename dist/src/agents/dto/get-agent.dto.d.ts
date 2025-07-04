import { UserStatus } from '@prisma/client';
export declare class GetAgentsDto {
    page?: string;
    limit?: string;
    status?: UserStatus;
    search?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    createdAt?: string;
    updatedAt?: string;
}
