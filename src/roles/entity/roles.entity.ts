import { Type } from 'class-transformer';
import { PermissionEntity } from '../../permissions/entity/permissions.entity';

export class RolesEntity {
  id: string;

  role: string;

  @Type(() => PermissionEntity)
  permissions: PermissionEntity[];

  createdAt: Date;

  updatedAt: Date;
}
