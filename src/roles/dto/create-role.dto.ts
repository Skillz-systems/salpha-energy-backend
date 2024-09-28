import { IsString, IsBoolean, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions?: string[];
}
