import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryTypes,
  InventoryClass,
  InventoryStatus,
  PrismaClient,
} from '@prisma/client';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MESSAGES } from '../constants';

describe('InventoryService', () => {
  let service: InventoryService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockCloudinaryService = {
    uploadFile: jest.fn().mockResolvedValue({
      secure_url: 'http://example.com/image.png',
    }),
  };

  const mockFile = {
    originalname: 'test.png',
    buffer: Buffer.from(''),
    mimetype: 'image/png',
  } as Express.Multer.File;

  const createInventoryDto: CreateInventoryDto = {
    name: 'Test Inventory',
    manufacturerName: 'Test Manufacturer',
    inventoryCategoryId: 'cat123',
    inventorySubCategoryId: 'subcat123',
    numberOfStock: '100',
    price: '100',
    class: InventoryClass.REGULAR,
    inventoryImage: mockFile,
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInventory', () => {
    it('should create an inventory item successfully', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue({
        id: 'cat123',
        name: 'Test Category',
        parentId: 'parentCat123',
        type: CategoryTypes.INVENTORY,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrismaService.inventory.findFirst.mockResolvedValue(null);

      mockPrismaService.inventory.create.mockResolvedValue({
        id: 'inv123',
        name: 'Test Item',
        createdAt: new Date(),
        updatedAt: new Date(),
        manufacturerName: 'Test Manufacturer',
        inventoryCategoryId: 'cat123',
        inventorySubCategoryId: 'subcat123',
        deletedAt: null,
      });

      mockPrismaService.inventoryBatch.create.mockResolvedValue({
        id: 'inv123',
        name: 'Test Item',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        dateOfManufacture: '2024-01-01',
        sku: 'SKU12345',
        image: 'http://example.com/image.png',
        batchNumber: 123456,
        costOfItem: 50,
        price: 100,
        numberOfStock: 100,
        inventoryId: 'inv123',
        remainingQuantity: 100,
        status: InventoryStatus.IN_STOCK,
        class: InventoryClass.REGULAR,
      });

      const result = await service.createInventory(
        createInventoryDto,
        mockFile,
      );

      const mockResult = {
        message: MESSAGES.INVENTORY_CREATED,
      };

      expect(result).toEqual(mockResult);
      expect(mockCloudinaryService.uploadFile).toHaveBeenCalled();
      expect(mockPrismaService.inventory.create).toHaveBeenCalled();
      expect(mockPrismaService.inventoryBatch.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when category is invalid', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.createInventory(createInventoryDto, {} as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
