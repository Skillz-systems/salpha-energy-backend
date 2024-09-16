import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PasswordMatches } from './customValidators/passwordMatches';

export class ForgotResetPasswordDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  resetToken?: string;

  @IsString({
    message: `{type: ['newPassword'], error: 'newPassword must be a string'}`,
  })
  @IsNotEmpty({
    message: `{type: ['newPassword'], error: 'newPassword cannot be empty'}`,
  })
  @MinLength(8, {
    message: `{type: ['newPassword'], error: 'newPassword cannot be less than 8 characters'}`,
  })
  @Matches(/\d/, {
    message: `{type: ['newPassword'], error: 'newPassword must contain at least one number'}`,
  })
  newPassword: string;

  @IsString({
    message: `{type: ['confirmNewPassword'], error: 'confirmNewPassword must be a string'}`,
  })
  @IsNotEmpty({
    message: `{type: ['confirmNewPassword'], error: 'confirmNewPassword cannot be empty'}`,
  })
  @PasswordMatches('newPassword')
  confirmNewPassword: string;
}
