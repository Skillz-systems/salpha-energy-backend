import { Controller, Post, Body, HttpCode, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { PasswordResetDTO } from './dto/password-reset.dto';

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
  @HttpCode(201)
  async addUser(@Body() registerUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.addUser(registerUserDto));
  }

  @Post('forgot-password')
  @ApiOkResponse({})
  @ApiBadRequestResponse({})
  @ApiInternalServerErrorResponse({})
  @ApiBody({
    type: ForgotPasswordDTO,
    description: 'Json structure for request payload',
  })
  @HttpCode(200)
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
  @HttpCode(200)
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
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDetails: PasswordResetDTO) {
    return this.authService.resetPassword(resetPasswordDetails);
  }
}
