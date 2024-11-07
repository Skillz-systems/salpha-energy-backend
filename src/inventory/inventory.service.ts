import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from '../constants';
import { CategoryTypes } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

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

  private generateBatchNumber(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }
}
