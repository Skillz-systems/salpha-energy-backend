import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  ActionEnum,
  PrismaClient,
  SubjectEnum,
  UserStatus,
} from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service'; // Adjust to your path
import { UsersModule } from '../src/users/users.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
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

  beforeAll(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('List users', () => {
    it('/users (GET)', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce(mockUsers);
      mockPrismaService.user.count.mockResolvedValueOnce(1);

      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.total).toBeTruthy();
      expect(response.body.page).toBeTruthy();
      expect(response.body.limit).toBeTruthy();
    });
  });
});
