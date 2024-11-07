import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { InventoryClass, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { MESSAGES } from '../constants';
import { FetchInventoryQueryDto } from './dto/fetch-inventory.dto';
import { mockInventoryResponse } from '../../test/mockData/inventory';

describe('InventoryController', () => {
  let controller: InventoryController;
  let inventoryService: InventoryService;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockInventoryService = {
    createInventory: jest.fn(),
    getInventories: jest.fn(),
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
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Inventory', () => {
    it('should create inventory', async () => {
      const mockResult = {
        message: MESSAGES.INVENTORY_CREATED,
      };

      mockInventoryService.createInventory.mockResolvedValue(mockResult);

      const result = await controller.create(createInventoryDto, mockFile);

      expect(inventoryService.createInventory).toHaveBeenCalledWith(
        createInventoryDto,
        mockFile,
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw a BadRequestException when inventory category is invalid', async () => {
      mockInventoryService.createInventory.mockRejectedValue(
        new BadRequestException(
          'Invalid inventorySubCategoryId or inventoryCategoryId',
        ),
      );

      await expect(
        controller.create(createInventoryDto, mockFile),
      ).rejects.toThrow(BadRequestException);

      expect(inventoryService.createInventory).toHaveBeenCalledWith(
        createInventoryDto,
        mockFile,
      );
    });
  });

  describe('Get Inventories', () => {
    it('should return a list of paginated inventories', async () => {
      const paginatedInventory = {
        inventories: mockInventoryResponse,
        total: 1,
        page: '1',
        limit: '10',
        totalPages: 1,
      };

      const query: FetchInventoryQueryDto = { page: '1', limit: '10' };
      mockInventoryService.getInventories.mockResolvedValueOnce(paginatedInventory);

      const result = await controller.getInventories(query);
      expect(result).toMatchObject(paginatedInventory);
      expect(mockInventoryService.getInventories).toHaveBeenCalledWith(query);
    });
  });
});
