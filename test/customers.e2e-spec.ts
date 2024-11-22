import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ActionEnum, PrismaClient, SubjectEnum } from '@prisma/client';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../src/auth/guards/roles.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { fakeData } from './mockData/user';
import { MESSAGES } from '../src/constants';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let mockPrismaService: DeepMockProxy<PrismaClient>;

  beforeAll(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'abc123' };
          return true;
        },
      })
      .overrideGuard(RolesAndPermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(' Create customer', () => {
    const mockDto = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      addressType: 'HOME',
      location: 'New York',
    };

    it('should create a new customer', async () => {
      (mockPrismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...fakeData,
        role: { id: 'role-id', role: 'customerUser' },
      });
      (mockPrismaService.role.findFirst as jest.Mock).mockResolvedValue({
        id: 'role-id',
        role: 'customerUser',
      });
      (mockPrismaService.permission.findFirst as jest.Mock).mockResolvedValue([
        {
          id: '66f4237486d300545d3b1f10',
          action: ActionEnum.read,
          subject: SubjectEnum.Customers,
        },
        {
          id: '66f42a3166aaf6fbb2a643bf',
          action: ActionEnum.write,
          subject: SubjectEnum.Customers,
        },
      ]);

      (mockPrismaService.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...mockDto,
      });

      const response = await request(app.getHttpServer())
        .post('/customers/create')
        .send(mockDto)

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        message: MESSAGES.CREATED,
      });
    });

  });
});
