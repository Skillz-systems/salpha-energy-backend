import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, TokenType } from '@prisma/client';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './../src/auth/auth.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { EmailService } from './../src/mailer/email.service';
import { MESSAGES } from '../src/constants';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockEmailService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const testData: CreateUserDto = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.test-data@example.com',
    phone: '09062736182',
    role: '66dce4173c5d3bc2fd5f5728',
    location: 'Abuja',
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testData.email },
    });
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { email: testData.email },
    });
  });

  describe('Add user', () => {
    it('/auth/add-user (POST) should add a new user', async () => {
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

      await prisma.user.create({
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

  describe('Forgot Password', () => {
    it('/auth/forgot-password (POST) should send a reset password email if user exists', async () => {
      const { role, ...dataWithoutRole } = testData;

      // First create a user
      await prisma.user.create({
        data: {
          ...dataWithoutRole,
          roleId: '66dce4173c5d3bc2fd5f5728',
          password: 'hashedPwd',
        },
      });

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
      const { role, ...dataWithoutRole } = testData;

      // First create a user
      const user = await prisma.user.create({
        data: {
          ...dataWithoutRole,
          roleId: '66dce4173c5d3bc2fd5f5728',
          password: 'hashedPwd',
        },
      });

      const resetToken = 'valid-reset-token';

      const token = await prisma.tempToken.create({
        data: {
          token: resetToken,
          token_type: TokenType.password_reset,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1-hour expiry
        },
      });

      const resetPasswordData = {
        resetToken: token.token,
        newPassword: 'new-password123',
        confirmNewPassword: 'new-password123',
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
      const { role, ...dataWithoutRole } = testData;

      // First create a user
      const user = await prisma.user.create({
        data: {
          ...dataWithoutRole,
          roleId: '66dce4173c5d3bc2fd5f5728',
          password: 'hashedPwd',
        },
      });
      const validResetToken = 'valid-reset-token';

      await prisma.tempToken.create({
        data: {
          token: validResetToken,
          token_type: 'password_reset',
          userId: user.id, // Use the created user's ID
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1-hour expiry
        },
      });

      // Call the verify-reset-token route
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
