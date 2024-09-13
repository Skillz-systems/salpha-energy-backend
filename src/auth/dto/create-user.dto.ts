import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MESSAGES } from '../../constants';
import { PasswordRelated } from '../customValidators/passwordRelated';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: MESSAGES.USERNAME_INVALID })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @PasswordRelated('email')
  @PasswordRelated('firstName', {
    message: `{type: ['password', 'firstName'], error: 'Password must not be similar to your First Name'}`,
  })
  @PasswordRelated('lastName', {
    message: `{type: ['password', 'lastName'], error: 'Password must not be similar to your Last Name'}`,
  })
  @MinLength(8, { message: MESSAGES.PASSWORD_TOO_WEAK })
  password: string;
}
