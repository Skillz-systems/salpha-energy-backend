import { UsersService } from './users.service';
import { UserEntity } from './entity/user.entity';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    listUsers(query: ListUsersQueryDto): Promise<{
        users: UserEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    superUserUpdateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    fetchUser(id: string): Promise<User>;
    superUserFetchUser(id: string): Promise<User>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
