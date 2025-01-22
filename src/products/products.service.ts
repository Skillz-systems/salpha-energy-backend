import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { MESSAGES } from '../constants';
import { CreateProductCategoryDto } from './dto/create-category.dto';
import { CategoryTypes } from '@prisma/client';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductsService {
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
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    creatorId: string,
  ) {
    const { name, description, currency, paymentModes, isTokenable, categoryId } =
      createProductDto;

    if (!ObjectId.isValid(categoryId))
      throw new BadRequestException('Invalid Product Category');

    const isCategoryValid = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        type: CategoryTypes.PRODUCT,
      },
    });

    if (!isCategoryValid) {
      throw new BadRequestException('Invalid Product Category');
    }

    let batchIds: string[] = [];

    const inventoryBatchId: string | string[] =
      createProductDto.inventoryBatchId;

    if (typeof inventoryBatchId === 'string') {
      batchIds = inventoryBatchId.split(',').map((id) => id.trim());
    } else if (Array.isArray(inventoryBatchId)) {
      batchIds = inventoryBatchId;
    }

    for (let i = 0; i < batchIds.length; i++) {
      if (!ObjectId.isValid(batchIds[i]))
        throw new BadRequestException(
          `Invalid Inventory Batch ID - ${batchIds[i]}`,
        );
    }
    // if (typeof JSON.parse(inventoryBatchId) === 'string') {
    //   batchIds = inventoryBatchId.split(',').map((id) => id.trim());
    // } else if (Array.isArray(JSON.parse(inventoryBatchId))) {
    //   batchIds = JSON.parse(inventoryBatchId);
    // }
    // Ensure inventoryBatchIds is an array
    // const batchIds = Array.isArray(inventoryBatchIds)
    //   ? inventoryBatchIds
    //   : inventoryBatchIds.split(',').map((id) => id.trim());

    const image = (await this.uploadInventoryImage(file)).secure_url;

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        image,
        currency,
        paymentModes,
        categoryId,
        creatorId,
        isTokenable
      },
    });

    if (inventoryBatchId?.length) {
      // Create many-to-many links in the ProductInventoryBatch table
      await this.prisma.productInventory.createMany({
        data: batchIds?.map((inventoryId) => ({
          productId: product.id,
          inventoryId,
        })),
      });
    }

    return product;
  }

  async getAllProducts(getProductsDto: GetProductsDto) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      createdAt,
      updatedAt,
      sortField,
      sortOrder,
      search,
    } = getProductsDto;

    const whereConditions: any = {};

    // Apply filtering conditions
    if (categoryId) whereConditions.productCategoryId = categoryId;
    if (createdAt) whereConditions.createdAt = { gte: new Date(createdAt) };
    if (updatedAt) whereConditions.updatedAt = { gte: new Date(updatedAt) };

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        // { price: { equals: parseFloat(search) } },
        // Add any other fields you want to search against
      ];
    }

    // if (search) {
    //   // Check if the search term is a valid number (to search price)
    //   const isNumber = !isNaN(parseFloat(search));
  
    //   whereConditions.OR = [
    //     {
    //       name: { contains: search, mode: 'insensitive' }, // Searching for product name
    //     },
    //     ...(isNumber
    //       ? [
    //           {
    //             price: { equals: parseFloat(search) }, // Search by price if it's a number
    //           },
    //         ]
    //       : []),
    //   ];
    // }

    const skip = (page - 1) * limit;

    const orderBy = sortField
      ? {
          [sortField]: sortOrder || 'asc',
        }
      : undefined;

    // Fetch products with pagination and filters
    const products = await this.prisma.product.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy,
      include: {
        // inventoryBatches: {
        //   include: {
        //     inventoryBatch: true,
        //   },
        // },
        category: true,
        creatorDetails: true,
      },
    });

    const total = await this.prisma.product.count({
      where: whereConditions,
    });

    return {
      products,
      total,
      page,
      totalPages: limit === 0 ? 0 : Math.ceil(total / limit),
      limit,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        creatorDetails: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async createProductCategory(
    createProductCategoryDto: CreateProductCategoryDto,
  ) {
    const { name } = createProductCategoryDto;


    const categoryExists = await this.prisma.category.findFirst({
      where: {
        name
      },
    });

    if (categoryExists) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        name,
        type: CategoryTypes.PRODUCT,
      },
    });
  }

  async getAllCategories() {
    return await this.prisma.category.findMany({
      where: {
        type: CategoryTypes.PRODUCT,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async getProductTabs(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        _count: {
          select: { customers: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }

    const tabs = [
      {
        name: 'Product Details',
        url: `/product/${productId}/details`,
      },
      {
        name: 'Stats',
        url: `/product/${productId}/stats`,
      },
      {
        name: 'Inventory Details',
        url: `/product/${productId}/inventory`,
      },
      {
        name: 'Customers',
        url: `/product/${productId}/customers`,
        count: product._count.customers,
      },
    ];

    return tabs;
  }

  async getProductInventory(productId: string) {
    const inventoryBatch = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventories: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!inventoryBatch) {
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }

    return inventoryBatch;
  }

  async getProductStatistics() {
    const allProducts = await this.prisma.product.count();

    if (!allProducts) {
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      allProducts,
    };
  }
}
