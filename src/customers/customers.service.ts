import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { MESSAGES } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { generateRandomPassword } from '../utils/generate-pwd';
import { hashPassword } from '../utils/helpers.util';
import { ActionEnum, Prisma, SubjectEnum, UserStatus } from '@prisma/client';
import { ListUsersQueryDto } from '../users/dto/list-users.dto';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../users/entity/user.entity';

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

  async userFilter(query: ListUsersQueryDto): Promise<Prisma.UserWhereInput> {
    const {
      search,
      firstname,
      lastname,
      username,
      email,
      phone,
      location,
      status,
      isBlocked,
      roleId,
      createdAt,
      updatedAt,
    } = query;

    const filterConditions: Prisma.UserWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { firstname: { contains: search, mode: 'insensitive' } },
                { lastname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        firstname
          ? { firstname: { contains: firstname, mode: 'insensitive' } }
          : {},
        lastname
          ? { lastname: { contains: lastname, mode: 'insensitive' } }
          : {},
        username
          ? { username: { contains: username, mode: 'insensitive' } }
          : {},
        email ? { email: { contains: email, mode: 'insensitive' } } : {},
        phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
        location
          ? { location: { contains: location, mode: 'insensitive' } }
          : {},
        status ? { status } : {},
        isBlocked !== undefined ? { isBlocked } : {},
        roleId ? { roleId } : {},
        createdAt ? { createdAt: new Date(createdAt) } : {},
        updatedAt ? { updatedAt: new Date(updatedAt) } : {},
      ],
    };

    return filterConditions;
  }

  async getUsers(query: ListUsersQueryDto) {
    const { page = 1, limit = 100, sortField, sortOrder } = query;

    const filterConditions = await this.userFilter(query);

    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const orderBy = sortField
      ? {
          [sortField]: sortOrder || 'asc',
        }
      : undefined;

    const result = await this.prisma.user.findMany({
      skip,
      take,
      where: {
        ...filterConditions,
        customerDetails: {
          isNot: null,
        },
      },
      orderBy,
      include: {
        customerDetails: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const customers = plainToInstance(UserEntity, result);

    const totalCount = await this.prisma.user.count({
      where: filterConditions,
    });

    return {
      customers,
      total: totalCount,
      page,
      limit,
      totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
    };
  }

  async fetchUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        customerDetails: {
          isNot: null,
        },
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    const serialisedData = plainToInstance(UserEntity, user);

    return serialisedData;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        customerDetails: {
          isNot: null,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    await this.prisma.customer.delete({
      where: { userId: id },
    });
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: MESSAGES.DELETED,
    };
  }

  async getCustomerStats() {
   const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const barredCustomerCount = await this.prisma.user.count({
    where: {
      status: UserStatus.barred,
      customerDetails: {
        isNot: null,
      },
    },
  });

  const newCustomerCount = await this.prisma.user.count({
    where: {
      customerDetails: {
        isNot: null,
      },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  const activeCustomerCount = await this.prisma.user.count({
    where: {
      status: UserStatus.active,
      customerDetails: {
        isNot: null,
      },
    },
  });

  const totalCustomerCount = await this.prisma.user.count({
    where: {
      customerDetails: {
        isNot: null,
      },
    },
  });

  return {
    barredCustomerCount,
    newCustomerCount,
    activeCustomerCount,
    totalCustomerCount,
  };}
}
