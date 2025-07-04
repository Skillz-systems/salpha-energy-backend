import { UserStatus } from '@prisma/client';
export declare class ListUsersQueryDto {
    firstname?: string;
    lastname?: string;
    username?: string;
    email?: string;
    phone?: string;
    location?: string;
    status?: UserStatus;
    isBlocked?: boolean;
    roleId?: string;
    createdAt?: string;
    updatedAt?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    page?: string;
    limit?: string;
}
