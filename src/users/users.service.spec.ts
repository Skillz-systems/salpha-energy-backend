import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  ActionEnum,
  PrismaClient,
  SubjectEnum,
  UserStatus,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '../constants';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validateOrReject: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockUsers = [
    {
      id: '66e9fe02014ca14746800d33',
      firstname: 'john',
      lastname: 'okor@gmail',
      username: null,
      password: 'wrehiohjorwerw',
      email: 'francisalexander000@gmail.com',
      phone: '09062736182',
      location: 'Abuja',
      staffId: null,
      status: UserStatus.active,
      isBlocked: false,
      roleId: '66e9ecc37cadd7f6e4b76e42',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lastLogin: null,
      role: {
        id: '66e9ecc37cadd7f6e4b76e42',
        role: 'admin',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        permissions: [
          {
            id: '66e9ecc37cadd7f6e4b76e43',
            action: ActionEnum.manage,
            subject: SubjectEnum.all,
            roleId: '66e9ecc37cadd7f6e4b76e42',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        ],
      },
    },
  ];

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('List User', () => {
    it('should return paginated users', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce(mockUsers);
      mockPrismaService.user.count.mockResolvedValueOnce(1);

      const result = await service.getUsers(1, 10);
      expect(result).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('Update User', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateUser('nonexistent-id', {} as UpdateUserDto),
      ).rejects.toThrow(new NotFoundException(MESSAGES.USER_NOT_FOUND));
    });

    it('should validate the DTO', async () => {
      const mockUser = { id: 'test-id', username: 'testuser' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const updateDto: UpdateUserDto = { username: 'newusername' };
      await service.updateUser('test-id', updateDto);

      expect(validateOrReject).toHaveBeenCalledWith(expect.any(UpdateUserDto));
    });

    it('should update the user successfully', async () => {
      const mockUser = { id: 'test-id', username: 'testuser' };
      const updatedUser = { id: 'test-id', username: 'newusername' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUser('test-id', {
        username: 'newusername',
      });

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { username: 'newusername' },
      });
    });
  });
});
