import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { BadRequestException } from '@nestjs/common';
import { MESSAGES } from '../constants';

describe('CustomersController', () => {
  let controller: CustomersController;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockCustomerService = {
    createCustomer: jest.fn(),
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomerService,
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create customer', () => {
    const mockDto: CreateCustomerDto = {
      firstname: 'James',
      lastname: 'Lewis',
      email: 'jo2@example.com',
      phone: '+1234567890',
      addressType: 'HOME',
      location: 'New York, USA',
      longitude: '',
      latitude: '',
    };

    it('should create a customer with credentials', async () => {
      const mockUserId = 'user-id';

      mockCustomerService.createCustomer.mockResolvedValue({
        message: MESSAGES.CREATED,
      });

      expect(await controller.create(mockDto, mockUserId)).toEqual({
        message: MESSAGES.CREATED,
      });
      expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });

    it('should throw error customer with email exists already', async () => {
      const dto: CreateCustomerDto = { ...mockDto };

      const mockCreatorId = 'creator-id';

      mockCustomerService.createCustomer.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.create(dto, mockCreatorId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
