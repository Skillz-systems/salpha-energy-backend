import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { MESSAGES } from '../constants';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

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
    login: jest.fn(),
    verifyResetToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

   const mockJwtService = {
     sign: jest.fn(),
   };

  const testData = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    phone: '09062736182',
    role: '66dce4173c5d3b2fd5f5728',
    location: 'Abuja',
  };

  const loginCred: LoginUserDTO = {
    email: testData.email,
    password: 'password',
  };

  const resetPwdData: PasswordResetDTO = {
    newPassword: 'new-password',
    confirmNewPassword: 'new-password',
    resetToken: 'valid-reset-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        { provide: JwtService, useValue: mockJwtService },
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
      const dto: CreateUserDto = { ...testData };

      const result = { id: 'user-id', ...dto };
      mockAuthService.addUser.mockResolvedValue(result);

      expect(await controller.addUser(dto)).toEqual(result);
      expect(mockAuthService.addUser).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when service throws', async () => {
      const dto: CreateUserDto = { ...testData };

      mockAuthService.addUser.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.addUser(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return user information and set accessToken header', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      mockAuthService.login.mockResolvedValue(mockUser);

      await controller.login(loginCred, mockRes);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginCred, mockRes);
    });

    it('should handle UnauthorizedException', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginCred, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle InternalServerErrorException', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      mockAuthService.login.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.login(loginCred, mockRes)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDTO = { email: testData.email };

    it('should call forgotPassword and return a success message', async () => {
      const message = { message: MESSAGES.PWD_RESET_MAIL_SENT };
      mockAuthService.forgotPassword.mockResolvedValue(message);

      expect(await controller.forgotPassword(forgotPasswordDTO)).toEqual(
        message,
      );
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDTO,
      );
    });

    it('should throw BadRequestException when service throws', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(
        new BadRequestException(MESSAGES.USER_NOT_FOUND),
      );

      await expect(
        controller.forgotPassword(forgotPasswordDTO),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyResetToken', () => {
    it('should verify reset token', async () => {
      const resetToken = 'valid-reset-token';
      const response = { message: MESSAGES.TOKEN_VALID };

      mockAuthService.verifyResetToken.mockResolvedValue(response);

      expect(await controller.verifyResetToken(resetToken)).toEqual(response);
      expect(mockAuthService.verifyResetToken).toHaveBeenCalledWith(resetToken);
    });

    it('should throw BadRequestException when service throws', async () => {
      const resetToken = 'invalid-reset-token';

      mockAuthService.verifyResetToken.mockRejectedValue(
        new BadRequestException(MESSAGES.INVALID_TOKEN),
      );

      await expect(controller.verifyResetToken(resetToken)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const response = { message: MESSAGES.PWD_RESET_SUCCESS };

      mockAuthService.resetPassword.mockResolvedValue(response);

      expect(await controller.resetPassword(resetPwdData)).toEqual(response);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPwdData);
    });

    it('should throw BadRequestException when service throws', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException(MESSAGES.INVALID_TOKEN),
      );

      await expect(controller.resetPassword(resetPwdData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
