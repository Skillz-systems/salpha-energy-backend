import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './../src/auth/auth.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { EmailService } from './../src/mailer/email.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockEmailService = {
    sendMail: jest.fn(),
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
      imports: [
        AuthModule,
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            connection: {
              host: configService.get<string>('REDIS_HOST'),
              port: configService.get<number>('REDIS_PORT'),
              password: configService.get<string>('REDIS_PASSWORD'),
              username: configService.get<string>('REDIS_USERNAME'),
            },
            defaultJobOptions: {
              delay: 999999999999999,
            },
          }),
        }),
        BullModule.registerQueue({
          name: 'emailSending',
        }),
      ],
      providers: [
        { provide: EmailService, useValue: mockEmailService },
      ],
    })
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

  describe('Add user', () => {
    it('/auth/add-user (POST) should add a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/add-user')
        .send(testData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstname', 'John');
    }, 10000);

    it('/auth/add-user (POST) should return 400 if email already exists', async () => {
      // First create a user
      await prisma.user.create({
        data: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '09062736182',
          roleId: '66dce4173c5d3bc2fd5f5728',
          location: 'Abuja',
          password: 'hashedPwd',
        },
      });

      await request(app.getHttpServer())
        .post('/auth/add-user')
        .send({
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '09062736182',
          role: '66dce4173c5d3b2fd5f5728',
          location: 'Abuja',
        })
        .expect(400);
    });
  });
});
