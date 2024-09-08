import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MESSAGES } from '../../constants';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: MESSAGES.USERNAME_INVALID })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: MESSAGES.PASSWORD_TOO_WEAK })
  password: string;
}
