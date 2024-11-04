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
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '../constants';
import { ListUsersQueryDto } from './dto/list-users.dto';

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

      const paginatedUsers = {
        users: plainToInstance(UserEntity, mockUsers),
        total: 1,
        page: '1',
        limit: '10',
        totalPages: 1,
      };

      const query: ListUsersQueryDto = { page: '1', limit: '10' };

      const result = await service.getUsers(query);
      expect(result).toEqual(paginatedUsers);
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

  describe('fetchUser', () => {
    it('should return a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUsers[0]);

      const result = await service.fetchUser('66e9fe02014ca14746800d33');

      expect(result).toEqual(plainToInstance(UpdateUserDto, mockUsers[0]));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '66e9fe02014ca14746800d33' },
        include: { role: { include: { permissions: true } } },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.fetchUser('nonexistent-id')).rejects.toThrow(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUsers[0]);
      mockPrismaService.user.delete.mockResolvedValue({} as any);

      const result = await service.deleteUser('66e9fe02014ca14746800d33');

      expect(result).toEqual({ message: MESSAGES.DELETED });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '66e9fe02014ca14746800d33' },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );
    });
  });
});
