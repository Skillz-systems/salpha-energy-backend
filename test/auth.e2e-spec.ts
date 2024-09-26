import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './../src/auth/auth.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { EmailService } from './../src/mailer/email.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockEmailService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const testData = {
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
      
      // First create a user
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
});
