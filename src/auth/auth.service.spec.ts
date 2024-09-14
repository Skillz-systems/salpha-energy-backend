import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../mailer/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { useContainer } from 'class-validator';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let emailService: EmailService;
  let configService: ConfigService;

  let mockPrismaService: DeepMockProxy<PrismaClient>;

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'mail.from') {
        return 'no-reply@a4tenergy.com';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Add User', () => {
    it('should create a new user and send email', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '09062736182',
        role: '66dce4173c5d3b2fd5f5728',
        location: 'Abuja',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 'role-id',
        name: 'admin',
      });

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...dto,
      });

      const result = await service.addUser(dto);

      expect(result).toEqual({ id: 'user-id', ...dto });
      expect(prisma.user.create).toHaveBeenCalled();

      expect(mockEmailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: dto.email,
          subject: expect.any(String),
          from: null,
          template: expect.any(String),
          context: expect.objectContaining({
            firstname: dto.firstname,
            loginUrl: expect.any(String),
            platformName: expect.any(String),
            supportEmail: null,
            tempPassword: expect.any(String),
            userEmail: dto.email,
          }),
        }),
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '09062736182',
        role: '66dce4173c5d3b2fd5f5728',
        location: 'Abuja',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
      });

      await expect(service.addUser(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });

    it('should throw BadRequestException if role does not exist', async () => {
      const dto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '09062736182',
        role: 'non-existent-role-id',
        location: 'Abuja',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.addUser(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { id: dto.role },
      });
    });
  });
});
