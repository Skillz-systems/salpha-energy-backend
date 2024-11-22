import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ActionEnum, PrismaClient, SubjectEnum } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { fakeData } from '../../src/../test/mockData/user';
import { MESSAGES } from '../constants';
import { BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Customer', () => {
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

    it('should create customer if email does not exist', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...fakeData,
        role: { id: 'role-id', role: 'customerUser' },
      });
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 'role-id',
        role: 'customerUser',
      });
      (prisma.permission.findFirst as jest.Mock).mockResolvedValue([
        {
          id: '66f4237486d300545d3b1f10',
          action: ActionEnum.read,
          subject: SubjectEnum.Customers,
        },
        {
          id: '66f42a3166aaf6fbb2a643bf',
          action: ActionEnum.write,
          subject: SubjectEnum.Customers,
        },
      ]);

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...mockDto,
      });
      const result = await service.createCustomer('creator-id', mockDto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({ message: MESSAGES.CREATED });
    });

    it('should throw error if email already exists', async () => {

      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
      });

      await expect(
        service.createCustomer('creator-id', mockDto),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: mockDto.email },
      });
    });
  });
});
