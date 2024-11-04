import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ActionEnum,
  PrismaClient,
  SubjectEnum,
  UserStatus,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UserEntity } from './entity/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from '../constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockUsersService = {
    getUsers: jest.fn(),
    updateUser: jest.fn(),
    fetchUser: jest.fn(),
    deleteUser: jest.fn(),
  };

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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('List User', () => {
    it('should return a list of paginated users', async () => {
      const paginatedUsers = {
        users: plainToInstance(UserEntity, mockUsers),
        total: 1,
        page: '1',
        limit: '10',
        totalPages: 1,
      };

      const query: ListUsersQueryDto = { page: '1', limit: '10' };
      mockUsersService.getUsers.mockResolvedValueOnce(paginatedUsers);

      const result = await controller.listUsers(query);
      expect(result).toMatchObject(paginatedUsers);
      expect(userService.getUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('Update User', () => {
    it('should throw BadRequestException if the DTO is empty', async () => {
      await expect(controller.updateUser('test-id', {})).rejects.toThrow(
        new BadRequestException(MESSAGES.EMPTY_OBJECT),
      );
    });

    it('should call updateUser service method', async () => {
      const updateUserDto: UpdateUserDto = { username: 'newusername' };
      const mockUser = { id: 'test-id', username: 'newusername' };
      mockUsersService.updateUser.mockResolvedValue(mockUser);

      const result = await controller.updateUser('test-id', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        'test-id',
        updateUserDto,
      );
    });
  });

  describe('Fetch User', () => {
    it('should return a user if found', async () => {
      const userEntity = plainToInstance(UserEntity, mockUsers[0]);
      mockUsersService.fetchUser.mockResolvedValueOnce(userEntity);

      const result = await controller.fetchUser('66e9fe02014ca14746800d33');
      expect(result).toEqual(userEntity);
      expect(mockUsersService.fetchUser).toHaveBeenCalledWith(
        '66e9fe02014ca14746800d33',
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.fetchUser.mockRejectedValueOnce(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );

      await expect(controller.fetchUser('nonexistent-id')).rejects.toThrow(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );
      expect(mockUsersService.fetchUser).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('Delete User', () => {
    it('should call deleteUser service method and return success message', async () => {
      mockUsersService.deleteUser.mockResolvedValueOnce({
        message: MESSAGES.DELETED,
      });

      const result = await controller.deleteUser('66e9fe02014ca14746800d33');
      expect(result).toEqual({ message: MESSAGES.DELETED });
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(
        '66e9fe02014ca14746800d33',
      );
    });

    it('should throw NotFoundException if user to delete is not found', async () => {
      mockUsersService.deleteUser.mockRejectedValueOnce(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );

      await expect(controller.deleteUser('nonexistent-id')).rejects.toThrow(
        new NotFoundException(MESSAGES.USER_NOT_FOUND),
      );
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(
        'nonexistent-id',
      );
    });
  });
});
