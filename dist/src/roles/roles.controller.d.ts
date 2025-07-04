import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignUserToRoleDto } from './dto/assign-user.dto';
export declare class RolesController {
    private readonly roleService;
    constructor(roleService: RolesService);
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
    findAll(): Promise<import("./entity/roles.entity").RolesEntity[]>;
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
        message: string;
    }>;
    assignUserToRole(id: string, assignUserToRoleDto: AssignUserToRoleDto): Promise<{
        message: string;
    }>;
    getRole(roleId: string): Promise<any>;
}
