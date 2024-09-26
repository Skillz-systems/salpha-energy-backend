import {
  Controller,
  Post,
  Body,
  HttpCode,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('add-user')
  @ApiCreatedResponse({})
  @ApiBadRequestResponse({})
  @ApiInternalServerErrorResponse({})
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for request payload',
  })
  @HttpCode(HttpStatus.CREATED)
  async addUser(@Body() registerUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.addUser(registerUserDto));
  }

  @SkipThrottle({ default: false })
  @Post('login')
  @ApiOkResponse({})
  @ApiBadRequestResponse({})
  @ApiUnauthorizedResponse({})
  @ApiInternalServerErrorResponse({})
  @ApiBody({
    type: LoginUserDTO,
    description: 'Json structure for request payload',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() userDetails: LoginUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return new UserEntity(await this.authService.login(userDetails, res));
  }

  @Post('forgot-password')
  @ApiOkResponse({})
  @ApiBadRequestResponse({})
  @ApiInternalServerErrorResponse({})
  @ApiBody({
    type: ForgotPasswordDTO,
    description: 'Json structure for request payload',
  })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDetails: ForgotPasswordDTO) {
    return this.authService.forgotPassword(forgotPasswordDetails);
  }

  @Post('verify-reset-token/:resetToken')
  @ApiParam({
    name: 'resetToken',
    description: 'The token used for password reset verification',
    type: String,
  })
  @ApiOkResponse({})
  @ApiBadRequestResponse({})
  @ApiInternalServerErrorResponse({})
  @HttpCode(HttpStatus.OK)
  verifyResetToken(@Param('resetToken') resetToken: string) {
    return this.authService.verifyResetToken(resetToken);
  }

  @Post('reset-password')
  @ApiOkResponse({})
  @ApiBadRequestResponse({})
  @ApiInternalServerErrorResponse({})
  @ApiBody({
    type: PasswordResetDTO,
    description: 'Json structure for request payload',
  })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDetails: PasswordResetDTO) {
    return this.authService.resetPassword(resetPasswordDetails);
  }
}
