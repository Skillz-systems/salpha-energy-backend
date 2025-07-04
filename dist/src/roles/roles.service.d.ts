import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignUserToRoleDto } from './dto/assign-user.dto';
import { RolesEntity } from './entity/roles.entity';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private isValidObjectId;
    create(createRoleDto: CreateRoleDto, id: string): Promise<{
        role: string;
        id: string;
        active: boolean | null;
        permissionIds: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
    }>;
    findAll(): Promise<RolesEntity[]>;
    findOne(id: string): Promise<{
        permissions: {
            subject: import("@prisma/client").$Enums.SubjectEnum;
            id: string;
            roleIds: string[];
            created_at: Date;
            updated_at: Date | null;
            deleted_at: Date | null;
            action: import("@prisma/client").$Enums.ActionEnum;
        }[];
    } & {
        role: string;
        id: string;
        active: boolean | null;
        permissionIds: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        permissions: {
            subject: import("@prisma/client").$Enums.SubjectEnum;
            id: string;
            roleIds: string[];
            created_at: Date;
            updated_at: Date | null;
            deleted_at: Date | null;
            action: import("@prisma/client").$Enums.ActionEnum;
        }[];
    } & {
        role: string;
        id: string;
        active: boolean | null;
        permissionIds: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
    }>;
    remove(id: string): Promise<{
        role: string;
        id: string;
        active: boolean | null;
        permissionIds: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
    }>;
    assignUserToRole(id: string, assignUserToRoleDto: AssignUserToRoleDto): Promise<{
        message: string;
    }>;
    getRoleWithUsersAndPermissions(roleId: string): Promise<{
        permissions: {
            subject: import("@prisma/client").$Enums.SubjectEnum;
            id: string;
            roleIds: string[];
            created_at: Date;
            updated_at: Date | null;
            deleted_at: Date | null;
            action: import("@prisma/client").$Enums.ActionEnum;
        }[];
        users: {
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
        }[];
    } & {
        role: string;
        id: string;
        active: boolean | null;
        permissionIds: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
    }>;
}
