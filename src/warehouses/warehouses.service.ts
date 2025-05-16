import { Warehouse } from './entities/warehouse.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { GetWarehousesDto } from './dto/get-warehouse-dto';
import { Prisma } from '@prisma/client';
import { MESSAGES } from 'src/constants';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadInventoryImage(file: Express.Multer.File) {
    return await this.cloudinary.uploadFile(file).catch((e) => {
      throw e;
    });
  }

  async create(
    createWarehouseDto: CreateWarehouseDto,
    file: Express.Multer.File,
  ) {
    const { name, type, inventoryClasses } = createWarehouseDto;

    const image = (await this.uploadInventoryImage(file)).secure_url;

    const warehouse = await this.prisma.warehouse.create({
      data: {
        name,
        type,
        inventoryClasses,
        image
      },
    });

    return warehouse;
  }

  async getAllWarehouses(getWarehousesDto: GetWarehousesDto) {
    const {
      page = 1,
      limit = 10,
      createdAt,
      updatedAt,
      sortField,
      sortOrder,
      search,
    } = getWarehousesDto;

    const whereConditions: Prisma.WarehouseWhereInput = {
      AND: [
        search
          ? {
              OR: [{ name: { contains: search, mode: 'insensitive' } }],
            }
          : {},
        createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
        updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
      ],
    };

    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const orderBy = {
      [sortField || 'createdAt']: sortOrder || 'asc',
    };

    const result = await this.prisma.warehouse.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy,
    });

    const total = await this.prisma.warehouse.count({
      where: whereConditions,
    });

    const formattedResult = result.map((warehouse) => ({
      ...warehouse,
      total: 0,
      }))

    return {
      result: formattedResult,
      total,
      page,
      totalPages: limit === 0 ? 0 : Math.ceil(total / limit),
      limit,
    };
  }

  async getWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(MESSAGES.WAREHOUSE_NOT_FOUND);
    }

    return {
      ...warehouse,
      total: 0,
    };
  }


  async deactivateWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(MESSAGES.WAREHOUSE_NOT_FOUND);
    }

    if (warehouse.status === 'deactivated') {
      throw new ConflictException("Where already deactivated");
    }

    const updatedWarehouse = await this.prisma.warehouse.update({
      where: { id },
      data: { status: 'deactivated' },
    });

    return updatedWarehouse;
  }

  async getWarehouseStatistics() {
    const allWarehouses = await this.prisma.warehouse.count();

    if (!allWarehouses) {
      throw new NotFoundException(MESSAGES.WAREHOUSE_NOT_FOUND);
    }

    return {
      allWarehouses,
    };
  }

  update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  remove(id: number) {
    return `This action removes a #${id} warehouse`;
  }
}
