import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    create(createPermissionDto: CreatePermissionDto): Promise<{
        subject: import("@prisma/client").$Enums.SubjectEnum;
        id: string;
        roleIds: string[];
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
        action: import("@prisma/client").$Enums.ActionEnum;
    }>;
    findAll(): Promise<{
        subject: import("@prisma/client").$Enums.SubjectEnum;
        id: string;
        roleIds: string[];
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
        action: import("@prisma/client").$Enums.ActionEnum;
    }[]>;
    findAllPermissionSubjects(): Promise<{
        subjects: ("User" | "all" | "Sales" | "Agents" | "Customers" | "Inventory" | "Accounts" | "Products" | "Contracts" | "Support" | "Communication")[];
    }>;
    findOne(id: string): Promise<{
        subject: import("@prisma/client").$Enums.SubjectEnum;
        id: string;
        roleIds: string[];
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
        action: import("@prisma/client").$Enums.ActionEnum;
    }>;
    update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<{
        message: string;
        data: {
            subject: import("@prisma/client").$Enums.SubjectEnum;
            id: string;
            roleIds: string[];
            created_at: Date;
            updated_at: Date | null;
            deleted_at: Date | null;
            action: import("@prisma/client").$Enums.ActionEnum;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
