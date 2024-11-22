import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { MESSAGES } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { generateRandomPassword } from '../utils/generate-pwd';
import { hashPassword } from '../utils/helpers.util';
import { ActionEnum, SubjectEnum } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(id: string, createCustomerDto: CreateCustomerDto) {
    const { longitude, latitude, ...rest } = createCustomerDto;

    const emailExists = await this.prisma.user.findFirst({
      where: {
        email: rest.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException(MESSAGES.EMAIL_EXISTS);
    }

    const creator = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    const newPwd = generateRandomPassword(30);
    const hashedPwd = await hashPassword(newPwd);

    let role = await this.prisma.role.findFirst({
      where: {
        role: 'customerUser',
      },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          role: 'customerUser',
          created_by: creator.id,
        },
      });
    }

    const permissions = [
      {
        action: ActionEnum.read,
        subject: SubjectEnum.Customers,
      },
      {
        action: ActionEnum.write,
        subject: SubjectEnum.Customers,
      },
    ];

    const existingCustomerPermissions = await this.prisma.permission.findFirst({
      where: {
        AND: permissions,
      },
    });

    if (!existingCustomerPermissions) {
      await Promise.all(
        permissions.map((permission) =>
          this.prisma.permission.create({
            data: {
              ...permission,
              roles: {
                connect: {
                  id: role.id,
                },
              },
            },
          }),
        ),
      );
    }

    await this.prisma.user.create({
      data: {
        ...(longitude && { longitude }),
        ...(latitude && { latitude }),
        password: hashedPwd,
        roleId: role.id,
        customerDetails: {
          create: {
            createdBy: creator.role.role,
            creatorId: creator.id,
          },
        },
        ...rest,
      },
    });

    return { message: MESSAGES.CREATED };
  }

  findAll() {
    return `This action returns all customers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
