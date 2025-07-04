import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    userFilter(query: ListUsersQueryDto): Promise<Prisma.UserWhereInput>;
    getUsers(query: ListUsersQueryDto): Promise<{
        users: UserEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<{
        createdAt: Date;
        firstname: string | null;
        lastname: string | null;
        email: string;
        phone: string | null;
        location: string | null;
        id: string;
        username: string | null;
        password: string;
        addressType: import("@prisma/client").$Enums.AddressType | null;
        staffId: string | null;
        longitude: string | null;
        latitude: string | null;
        emailVerified: boolean;
        isBlocked: boolean;
        status: import("@prisma/client").$Enums.UserStatus;
        roleId: string;
        updatedAt: Date;
        deletedAt: Date | null;
        lastLogin: Date | null;
    }>;
    fetchUser(id: string): Promise<UpdateUserDto>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
