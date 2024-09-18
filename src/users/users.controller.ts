import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entity/user.entity';
import { PaginatedUsers } from './entity/paginated-users.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';

@SkipThrottle()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
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
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of rows per page page',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const result = await this.usersService.getUsers(page, limit);
    result.users = plainToInstance(UserEntity, result.users);

    return new PaginatedUsers(result);
  }
}
