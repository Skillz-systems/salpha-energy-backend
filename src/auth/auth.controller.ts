import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('add-user')
  @ApiCreatedResponse({})
  @ApiBadRequestResponse({})
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for request payload',
  })
  @HttpCode(201)
  async addUser(@Body() registerUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.addUser(registerUserDto));
  }
}
