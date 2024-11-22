import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { ActionEnum, SubjectEnum } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/getUser';
import { UserEntity } from '../users/entity/user.entity';
import { ListUsersQueryDto } from '../users/dto/list-users.dto';

@SkipThrottle()
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [
      `${ActionEnum.manage}:${SubjectEnum.Agents}`,
      `${ActionEnum.manage}:${SubjectEnum.Customers}`,
    ],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiBody({
    type: CreateCustomerDto,
    description: 'Json structure for request payload',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Body() createCustomersDto: CreateCustomerDto,
    @GetUser('id') id: string,
  ) {
    return await this.customersService.createCustomer(id, createCustomersDto);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [
      `${ActionEnum.manage}:${SubjectEnum.Agents}`,
      `${ActionEnum.manage}:${SubjectEnum.Customers}`,
    ],
  })
  @Get()
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    description: 'List all customers with pagination',
    type: UserEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({})
  @ApiExtraModels(ListUsersQueryDto)
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
  async listCustomers(@Query() query: ListUsersQueryDto) {
    return await this.customersService.getUsers(query);
  }
}
