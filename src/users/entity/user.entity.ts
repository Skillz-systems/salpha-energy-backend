import { Exclude } from 'class-transformer';
import { ActionEnum, SubjectEnum, User, UserStatus } from '@prisma/client';

export class PermissionEntity {
  id: string;
  action: ActionEnum; 
  subject: SubjectEnum; 
  roleId: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export class RoleEntity {
  id: string;
  role: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  permissions: PermissionEntity[]; 
}

export class UserEntity implements Partial<User> {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  staffId: string;
  isBlocked: boolean;
  lastLogin: Date;

  role: RoleEntity;
  roleId: string;

  status: UserStatus;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
