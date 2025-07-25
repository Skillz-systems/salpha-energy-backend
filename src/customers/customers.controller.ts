import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { ActionEnum, SubjectEnum, User } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetSessionUser } from '../auth/decorators/getUser';
import { UserEntity } from '../users/entity/user.entity';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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
    @GetSessionUser('id') requestUserId: string,
  ) {
    return await this.customersService.createCustomer(
      requestUserId,
      createCustomersDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Customers}`],
  })
  @Get()
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    description: 'List all customers with pagination',
    type: UserEntity,
    isArray: true,
  })
  @ApiBadRequestResponse({})
  @ApiExtraModels(ListCustomersQueryDto)
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
  async listCustomers(@Query() query: ListCustomersQueryDto) {
    return await this.customersService.getCustomers(query);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Customers}`],
  })
  @ApiParam({
    name: 'id',
    description: "Customer's id to update",
  })
  @ApiBody({
    type: UpdateCustomerDto,
    description: 'Json structure for update request payload',
  })
  @ApiOperation({
    summary: 'Update customer',
    description:
      'Update customer details with optional new passport photo and ID image',
  })
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    type: UserEntity,
    description: 'Updated customer details',
  })
  @ApiBadRequestResponse({})
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'passportPhoto', maxCount: 1 },
      { name: 'idImage', maxCount: 1 },
      { name: 'contractFormImage', maxCount: 1 },
    ]),
  )
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UploadedFiles()
    files: {
      passportPhoto?: Express.Multer.File[];
      idImage?: Express.Multer.File[];
      contractFormImage?: Express.Multer.File[];
    },
  ) {
    // Validate files if provided
    if (files?.passportPhoto?.[0]) {
      const passportPhotoValidator = new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

      await passportPhotoValidator.transform(files.passportPhoto[0]);
    }

    if (files?.idImage?.[0]) {
      const idImageValidator = new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

      await idImageValidator.transform(files.idImage[0]);
    }

    if (files?.contractFormImage?.[0]) {
      const contractFormImage = new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

      await contractFormImage.transform(files.contractFormImage[0]);
    }

    return await this.customersService.updateCustomer(
      id,
      updateCustomerDto,
    );
  }



  // @UseGuards(JwtAuthGuard)
  // @RolesAndPermissions({
  //   permissions: [`${ActionEnum.read}:${SubjectEnum.Customers}`],
  // })
  // @Get('/single')
  // @ApiOperation({
  //   summary: 'Fetch customer details',
  //   description:
  //     'This endpoint allows an authenticated customer to fetch their details.',
  // })
  // @ApiBearerAuth('access_token')
  // @ApiOkResponse({
  //   type: UserEntity,
  // })
  // async fetchCustomer(@GetUser('id') id: string): Promise<User> {
  //   return new UserEntity(await this.customersService.getCustomer(id));
  // }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [
      // `${ActionEnum.manage}:${SubjectEnum.Agents}`,
      `${ActionEnum.manage}:${SubjectEnum.Customers}`,
    ],
  })
  @ApiParam({
    name: 'id',
    description: "Customer's id to fetch details",
  })
  @Get('single/:id')
  @ApiOperation({
    summary: 'Fetch customer details by superuser',
    description:
      'This endpoint allows a permitted customer fetch a user details.',
  })
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    type: UserEntity,
  })
  async fetchUser(@Param('id') id: string): Promise<User> {
    return new UserEntity(await this.customersService.getCustomer(id));
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Customers}`],
  })
  @ApiParam({
    name: 'id',
    description: "Customer's id",
  })
  @ApiOperation({
    summary: 'Delete customer by superuser',
    description: 'This endpoint allows a permitted customer to delete a user.',
  })
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    type: UserEntity,
  })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.customersService.deleteCustomer(id);
  }

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
  @Get('stats')
  @ApiOkResponse({
    description: 'Fetch Customer Statistics',
    isArray: true,
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  async getCustomerStats() {
    return await this.customersService.getCustomerStats();
  }

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
  @ApiParam({
    name: 'id',
    description: 'Customer id to fetch tabs',
  })
  @ApiOkResponse({
    description: 'Fetch Customer Details Tabs',
    isArray: true,
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @Get(':id/tabs')
  async getCustomerTabs(@Param('id') customerId: string) {
    return this.customersService.getCustomerTabs(customerId);
  }
}
