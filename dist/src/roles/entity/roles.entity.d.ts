import { PermissionEntity } from '../../permissions/entity/permissions.entity';
import { UserEntity } from '../../users/entity/user.entity';
export declare class RolesEntity {
    id: string;
    role: string;
    permissions: PermissionEntity[];
    creator?: UserEntity;
    createdAt: Date;
    updatedAt: Date;
}
