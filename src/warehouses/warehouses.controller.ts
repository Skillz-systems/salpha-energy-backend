import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { ActionEnum, SubjectEnum, Warehouse } from '@prisma/client';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetWarehousesDto } from './dto/get-warehouse-dto';

@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Inventory}`],
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
    type: CreateWarehouseDto,
    description: 'Json structure for request payload',
  })
  @ApiOperation({
    summary: 'Create warehouse',
    description: 'Create warehouse',
  })
  @ApiBadRequestResponse({})
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() CreateWarehouseDto: CreateWarehouseDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return await this.warehousesService.create(CreateWarehouseDto, file);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Inventory}`],
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
  @Get()
  @ApiOkResponse({
    description: 'Fetch all warehouses with pagination',
    isArray: true,
  })
  @ApiOperation({
    summary: 'Fetch all warehouses with pagination',
    description: 'Fetch all warehouses with pagination',
  })
  @ApiBadRequestResponse({})
  @ApiExtraModels(GetWarehousesDto)
  @HttpCode(HttpStatus.OK)
  async getAllWarehouses(@Query() GetWarehousesDto: GetWarehousesDto) {
    return this.warehousesService.getAllWarehouses(GetWarehousesDto);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Inventory}`],
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
    description: 'ID of the warehouse to fetch',
  })
  @ApiResponse({
    status: 200,
    description: 'The details of the warehouse.',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found.',
  })
  @Get(':id')
  @ApiOperation({
    summary: 'Fetch warehouse details',
    description:
      'This endpoint allows a permitted user fetch a warehouse details.',
  })
  async getWarehouse(@Param('id') id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesService.getWarehouse(id);

    return warehouse;
  }



  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Inventory}`],
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
    description: 'ID of the warehouse to deactivate',
  })
  @ApiResponse({
    status: 200,
    description: 'Warehouse deactivated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found.',
  })
  @Patch(':id')
  @ApiOperation({
    summary: 'Deactivate warehouse',
    description:
      'This endpoint allows a permitted user deactivate a warehouse.',
  })
  async deactivateWarehouse(@Param('id') id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesService.deactivateWarehouse(id);

    return warehouse;
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Inventory}`],
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
  @ApiOkResponse({
    description: 'Fetch Warehouse statistics',
  })
  @ApiOperation({
    summary: 'Fetch Warehouse statistics',
    description: 'Fetch Warehouse statistics',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @Get('/statistics/view')
  async getProductStatistics() {
    return this.warehousesService.getWarehouseStatistics();
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
  //   return this.warehousesService.update(+id, updateWarehouseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.warehousesService.remove(+id);
  // }
}
