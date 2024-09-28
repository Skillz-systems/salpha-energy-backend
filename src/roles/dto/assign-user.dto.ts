
import { IsMongoId } from 'class-validator';

export class AssignUserToRoleDto {
  @IsMongoId()
  roleId?: string
}

