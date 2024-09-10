import { Exclude } from 'class-transformer';
import { Role, User, UserStatus } from '@prisma/client';

interface IUserEntity extends Partial<User> {
  //  get testEntityMethod(): String;
}

export class UserEntity implements IUserEntity {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;

  role: Role;
  roleId: string;

  status: UserStatus;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  @Exclude()
  password: string;

  //   @Expose()
  //   get testEntityMethod() {
  //     return this.firstname + ' method';
  //   }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
