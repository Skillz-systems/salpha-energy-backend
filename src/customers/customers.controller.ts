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
  Res,
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
import { Response } from 'express';

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

    return await this.customersService.updateCustomer(id, updateCustomerDto);
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

  @Get('no-lga')
  async getCustomersWithNoLga(@Res() res: Response) {
    const customers = await this.customersService.getCustomersWithNoLga();

    // 1️⃣ Define the headers (CSV columns)
    const headers = [
      'id',
      'firstname',
      'lastname',
      'fullname',
      'phone',
      'state',
      'lga',
      'gender',
      'location',
      'longitude',
      'latitude',
    ];

    // 2️⃣ Convert to CSV rows
    const csvRows: string[] = [];
    csvRows.push(headers.join(',')); // first row: header

    for (const customer of customers) {
      const row = headers
        .map((field) => {
          let value = customer[field] ?? ''; // handle null/undefined
          // Escape double quotes by doubling them
          value = String(value).replace(/"/g, '""');
          // Wrap fields with commas, quotes, or newlines in double quotes
          if (/[,"\n]/.test(value)) {
            value = `"${value}"`;
          }
          return value;
        })
        .join(',');
      csvRows.push(row);
    }

    const csvContent = csvRows.join('\n');
    const filename = `customers-no-lga-${Date.now()}.csv`;

    // 3️⃣ Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent));

    // 4️⃣ Send CSV
    res.send(csvContent);
  }

  @Get('invalid-coordinates')
  @ApiOperation({
    summary: 'Get all customers with invalid coordinates (Not found)',
  })
  async findCustomersWithInvalidCoordinates(@Res() res: Response) {
    const data =
      await this.customersService.countCustomersWithInvalidCoordinates();

    if (!data || !data.length) {
      return res
        .status(404)
        .send('No customers with invalid coordinates found.');
    }

    // Extract headers from first object
    const headers = Object.keys(data[0]);

    // Build CSV content manually
    const csvRows = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map((header) => {
        let val = row[header];

        // Handle null or undefined
        if (val === null || val === undefined) val = '';

        // Escape double quotes and commas
        val = String(val).replace(/"/g, '""');

        // Wrap in double quotes if needed
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          val = `"${val}"`;
        }

        return val;
      });

      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const filename = `invalid_customers_${new Date().toISOString()}.csv`;

    // Set response headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf-8'));

    // Send CSV content
    res.send(csvContent);
  }
}
