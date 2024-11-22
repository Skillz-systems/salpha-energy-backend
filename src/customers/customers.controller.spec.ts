import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { BadRequestException } from '@nestjs/common';
import { MESSAGES } from '../constants';
import { mockUsersResponseData } from '../../src/../test/mockData/user';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../users/entity/user.entity';
import { ListUsersQueryDto } from '../users/dto/list-users.dto';

describe('CustomersController', () => {
  let controller: CustomersController;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockCustomerService = {
    createCustomer: jest.fn(),
    getUsers: jest.fn(),
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

   describe('List Customers', () => {
     it('should return a list of paginated customerss', async () => {
       const paginatedUsers = {
         users: plainToInstance(UserEntity, mockUsersResponseData),
         total: 1,
         page: '1',
         limit: '10',
         totalPages: 1,
       };

       const query: ListUsersQueryDto = { page: '1', limit: '10' };
       mockCustomerService.getUsers.mockResolvedValueOnce(paginatedUsers);

       const result = await controller.listCustomers(query);
       expect(result).toMatchObject(paginatedUsers);
       expect(mockCustomerService.getUsers).toHaveBeenCalledWith(query);
     });
   });
});
