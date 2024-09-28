import { ActionEnum, SubjectEnum } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {

  @IsEnum(ActionEnum, { message: 'Invalid action type' })
  action: ActionEnum;

  @IsEnum(SubjectEnum, { message: 'Invalid subject' })
  subject: SubjectEnum;


}
