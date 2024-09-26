import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    addUser: jest.fn((dto) => {
      return {
        id: 'user-id',
        ...dto,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // AuthService
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addUser', () => {
    it('should add a user', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '09062736182',
        role: '66dce4173c5d3b2fd5f5728',
        location: 'Abuja',
      };

      const result = { id: 'user-id', ...dto };
      mockAuthService.addUser.mockResolvedValue(result);

      expect(await controller.addUser(dto)).toEqual(result);
      expect(mockAuthService.addUser).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when service throws', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '09062736182',
        role: '66dce4173c5d3b2fd5f5728',
        location: 'Abuja',
      };

      mockAuthService.addUser.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.addUser(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
