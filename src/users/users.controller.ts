import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entity/user.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActionEnum, SubjectEnum, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '../constants';

@SkipThrottle()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles({
    roles: ['admin'],
    permissions: [`${ActionEnum.manage}:${SubjectEnum.User}`],
  })
  @Get()
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    description: 'List all users with pagination',
    type: UserEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({})
  @ApiQuery({
    name: 'page',
    description: 'The current page numer to view',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of rows per page page',
    type: String,
    required: false,
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.usersService.getUsers(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles({
    roles: ['admin'],
    permissions: [`${ActionEnum.manage}:${SubjectEnum.User}`],
  })
  @Patch(':id')
  @ApiBearerAuth('access_token')
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: UserEntity,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException(MESSAGES.EMPTY_OBJECT);
    }
    return new UserEntity(
      await this.usersService.updateUser(id, updateUserDto),
    );
  }
}
