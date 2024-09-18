import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, TokenType, User, UserStatus } from '@prisma/client';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './../src/auth/auth.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { EmailService } from './../src/mailer/email.service';
import { MESSAGES } from '../src/constants';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../src/utils/helpers.util', () => ({
  hashPassword: jest.fn().mockResolvedValue(expect.any(String)),
}));

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockEmailService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const testData: CreateUserDto = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.test-data@example.com',
    phone: '09062736182',
    role: '66dce4173c5d3bc2fd5f5728',
    location: 'Abuja',
  };

  const tokenData = {
    id: 'token-id',
    userId: 'user-id',
    token_type: TokenType.password_reset,
    token: 'token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const fakeData: User = {
    id: 'user-id',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$f+0kBa9fD6cExuwn/+Obug$C8I/ylTXWI7EzgrABXiVclIkJsbDu/jCEJ0LuwzqAzY',
    email: 'john.doe@example.com',
    phone: '1234567890',
    location: 'Some Location',
    staffId: 'staff-id',
    roleId: 'role-id',
    status: UserStatus.active,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastLogin: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Add user', () => {
    it('/auth/add-user (POST) should add a new user', async () => {
      const dto: CreateUserDto = { ...testData };

      (mockPrismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrismaService.role.findFirst as jest.Mock).mockResolvedValue({
        id: 'role-id',
        name: 'admin',
      });

      (mockPrismaService.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...dto,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/add-user')
        .send(testData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstname', 'John');
      expect(mockEmailService.sendMail).toHaveBeenCalled();
    }, 10000);

    it('/auth/add-user (POST) should return 400 if email already exists', async () => {
      const { role, ...dataWithoutRole } = testData;
      console.log({ role });

      await mockPrismaService.user.create({
        data: {
          ...dataWithoutRole,
          roleId: '66dce4173c5d3bc2fd5f5728',
          password: 'hashedPwd',
        },
      });

      await request(app.getHttpServer())
        .post('/auth/add-user')
        .send({
          testData,
        })
        .expect(400);
    });
  });

  describe('Login', () => {
    it('/auth/login (POST) should return a user with access token', async () => {
      const mockUser = {
        id: fakeData.id,
        email: fakeData.email,
        password: fakeData.password,
      };
      const mockAccessToken = 'token';

      // Set up the mock implementations
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (argon.verify as jest.Mock).mockResolvedValue(true);
      (mockJwtService.sign as jest.Mock).mockReturnValue(mockAccessToken);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testData.email, password: 'password' })
        .expect(200);

      expect(response.headers['access_token']).toBeDefined();
      expect(response.body).toHaveProperty('id', 'user-id');
    });
  });

  describe('Forgot Password', () => {
    it('/auth/forgot-password (POST) should send a reset password email if user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(fakeData);
      mockPrismaService.tempToken.findFirst.mockResolvedValue(null);

      const forgotPasswordData = { email: testData.email };

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(200);

      expect(response.body).toEqual({
        message: MESSAGES.PWD_RESET_MAIL_SENT,
      });
      expect(mockEmailService.sendMail).toHaveBeenCalled();
    });

    it('/auth/forgot-password (POST) should return 400 if user does not exist', async () => {
      const forgotPasswordData = { email: 'non-existent@example.com' };

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(400);
    });
  });

  describe('Reset Password', () => {
    it('/auth/reset-password (POST) should reset the password with a valid token', async () => {
      mockPrismaService.tempToken.findFirst.mockResolvedValue(tokenData);
      mockPrismaService.user.update.mockResolvedValue(fakeData);
      mockPrismaService.tempToken.update.mockResolvedValue(null);

      const resetPasswordData = {
        newPassword: 'new-password',
        confirmNewPassword: 'new-password',
        resetToken: 'valid-token',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordData)
        .expect(200);

      expect(response.body).toEqual({
        message: MESSAGES.PWD_RESET_SUCCESS,
      });
    });

    it('/auth/reset-password (POST) should return 400 with invalid or expired token', async () => {
      const resetPasswordData = {
        token: 'invalid-token',
        newPassword: 'new-password123',
      };

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordData)
        .expect(400);
    });
  });

  describe('Verify Reset Token', () => {
    it('/auth/verify-reset-token/:resetToken (POST) should verify a valid reset token', async () => {
      mockPrismaService.tempToken.findFirst.mockResolvedValue(tokenData);
      const validResetToken = 'valid-reset-token';

      const response = await request(app.getHttpServer())
        .post(`/auth/verify-reset-token/${validResetToken}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Token is valid' });
    });

    it('/auth/verify-reset-token/:resetToken (POST) should return 400 for an invalid or expired token', async () => {
      const invalidResetToken = 'invalid-reset-token';

      await request(app.getHttpServer())
        .post(`/auth/verify-reset-token/${invalidResetToken}`)
        .expect(400);
    });
  });
});
