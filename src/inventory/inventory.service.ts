import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from '../constants';
import { CategoryTypes, InventoryClass, Prisma } from '@prisma/client';
import { FetchInventoryQueryDto } from './dto/fetch-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async inventoryFilter(
    query: FetchInventoryQueryDto,
  ): Promise<Prisma.InventoryWhereInput> {
    const {
      search,
      inventoryCategoryId,
      inventorySubCategoryId,
      createdAt,
      updatedAt,
      class: inventoryClass,
    } = query;

    const filterConditions: Prisma.InventoryWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { manufacturerName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        inventoryCategoryId ? { inventoryCategoryId } : {},
        inventorySubCategoryId ? { inventorySubCategoryId } : {},
        createdAt ? { createdAt: new Date(createdAt) } : {},
        updatedAt ? { updatedAt: new Date(updatedAt) } : {},
        inventoryClass
          ? {
              batches: {
                some: { class: inventoryClass as InventoryClass },
              },
            }
          : {},
      ],
    };

    return filterConditions;
  }

  async uploadInventoryImage(file: Express.Multer.File) {
    return await this.cloudinary.uploadFile(file).catch((e) => {
      throw e;
    });
  }

  async createInventory(
    createInventoryDto: CreateInventoryDto,
    file: Express.Multer.File,
  ) {
    const { inventorySubCategoryId, inventoryCategoryId } = createInventoryDto;

    const isCategoryValid = await this.prisma.category.findFirst({
      where: {
        id: inventoryCategoryId,
        children: {
          some: {
            id: inventorySubCategoryId,
            type: CategoryTypes.INVENTORY,
          },
        },
        type: CategoryTypes.INVENTORY,
      },
    });

    if (!isCategoryValid) {
      throw new BadRequestException(
        'Invalid inventorySubCategoryId or inventoryCategoryId',
      );
    }

    const image = (await this.uploadInventoryImage(file)).secure_url;

    let inventoryData = await this.prisma.inventory.findFirst({
      where: {
        name: {
          equals: createInventoryDto.name,
          mode: 'insensitive',
        },
        manufacturerName: {
          equals: createInventoryDto.manufacturerName,
          mode: 'insensitive',
        },
      },
    });

    if (!inventoryData) {
      inventoryData = await this.prisma.inventory.create({
        data: {
          name: createInventoryDto.name,
          manufacturerName: createInventoryDto.manufacturerName,
          inventoryCategoryId: createInventoryDto.inventoryCategoryId,
          inventorySubCategoryId: createInventoryDto.inventorySubCategoryId,
        },
      });
    }

    const batchNumber = this.generateBatchNumber();

    await this.prisma.inventoryBatch.create({
      data: {
        inventory: { connect: { id: inventoryData.id } },
        name: createInventoryDto.name,
        ...(createInventoryDto.dateOfManufacture !== undefined && {
          dateOfManufacture: createInventoryDto.dateOfManufacture,
        }),
        ...(createInventoryDto.sku !== undefined && {
          sku: createInventoryDto.sku,
        }),
        ...(createInventoryDto.costOfItem !== undefined && {
          costOfItem: parseFloat(createInventoryDto.costOfItem),
        }),
        image,
        batchNumber: Number(batchNumber),
        price: parseFloat(createInventoryDto.price),
        numberOfStock: Number(createInventoryDto.numberOfStock),
        remainingQuantity: Number(createInventoryDto.numberOfStock),
        class: createInventoryDto.class,
      },
    });

    return {
      message: MESSAGES.INVENTORY_CREATED,
    };
  }

  async getInventories(query: FetchInventoryQueryDto) {
    const {
      page = 1,
      limit = 100,
      sortField,
      sortOrder,
      inventoryCategoryId,
      inventorySubCategoryId,
    } = query;

    if (inventoryCategoryId || inventorySubCategoryId) {
      const categoryIds = [inventoryCategoryId, inventorySubCategoryId].filter(
        Boolean,
      );

      const isCategoryValid = await this.prisma.category.findFirst({
        where: {
          id: {
            in: categoryIds,
          },
          type: CategoryTypes.INVENTORY,
        },
      });

      if (!isCategoryValid) {
        throw new BadRequestException(
          'Invalid inventorySubCategoryId or inventoryCategoryId',
        );
      }
    }

    const filterConditions = await this.inventoryFilter(query);

    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const orderBy = sortField
      ? {
          [sortField]: sortOrder || 'asc',
        }
      : undefined;

    const result = await this.prisma.inventory.findMany({
      skip,
      take,
      where: filterConditions,
      orderBy,
      include: {
        batches: true,
        inventoryCategory: true,
        inventorySubCategory: true,
      },
    });

    const totalCount = await this.prisma.inventory.count({
      where: filterConditions,
    });

    return {
      inventories: result,
      total: totalCount,
      page,
      limit,
      totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
    };
  }

  private generateBatchNumber(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }
}
