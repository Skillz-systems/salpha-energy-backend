import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserEntity } from './entity/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return new UserEntity(await this.usersService.register(registerUserDto));
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
