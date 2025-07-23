import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { MESSAGES } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../users/entity/user.entity';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
import { getLastNDaysDate } from '../utils/helpers.util';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(
    requestUserId: string,
    createCustomerDto: CreateCustomerDto,
  ) {
    const { longitude, latitude, email, ...rest } = createCustomerDto;

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { email },
    });

    if (existingCustomer) {
      throw new BadRequestException(MESSAGES.EMAIL_EXISTS);
    }

    await this.prisma.customer.create({
      data: {
        email,
        creatorId: requestUserId,
        ...(longitude && { longitude }),
        ...(latitude && { latitude }),
        ...rest,
      },
    });

    return { message: MESSAGES.CREATED };
  }

  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const {
      longitude,
      latitude,
      email,
      firstname,
      lastname,
      phone,
      alternatePhone,
      gender,
      addressType,
      installationAddress,
      lga,
      state,
      location,
      idType,
      idNumber,
      type,
      // ...rest
    } = updateCustomerDto;

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    if (email && email !== existingCustomer.email) {
      const customerWithEmail = await this.prisma.customer.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (customerWithEmail) {
        throw new BadRequestException(MESSAGES.EMAIL_EXISTS);
      }
    }

    console.log({ updateCustomerDto });

    // Prepare update data
    const updateData: any = {
      ...(firstname !== undefined && { firstname }),
      ...(lastname !== undefined && { lastname }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(addressType !== undefined && { addressType }),
      ...(location !== undefined && { location }),
      ...(alternatePhone !== undefined && { alternatePhone }),
      ...(gender !== undefined && { gender }),
      ...(installationAddress !== undefined && { installationAddress }),
      ...(lga !== undefined && { lga }),
      ...(state !== undefined && { state }),
      ...(longitude !== undefined && { longitude }),
      ...(latitude !== undefined && { latitude }),
      ...(idType !== undefined && { idType }),
      ...(idNumber !== undefined && { idNumber }),
      ...(type !== undefined && { type }),
      // ...rest,
    };

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        creatorDetails: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return { message: MESSAGES.UPDATED, customer: updatedCustomer };
  }

  async customerFilter(
    query: ListCustomersQueryDto,
  ): Promise<Prisma.CustomerWhereInput> {
    const {
      search,
      firstname,
      lastname,
      email,
      phone,
      location,
      status,
      createdAt,
      updatedAt,
      isNew,
    } = query;

    const filterConditions: Prisma.CustomerWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { firstname: { contains: search, mode: 'insensitive' } },
                { lastname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        firstname
          ? { firstname: { contains: firstname, mode: 'insensitive' } }
          : {},
        lastname
          ? { lastname: { contains: lastname, mode: 'insensitive' } }
          : {},
        email ? { email: { contains: email, mode: 'insensitive' } } : {},
        phone ? { phone: { contains: phone, mode: 'insensitive' } } : {},
        location
          ? { location: { contains: location, mode: 'insensitive' } }
          : {},
        status ? { status } : {},
        isNew
          ? {
              createdAt: {
                gte: getLastNDaysDate(7),
              },
            }
          : {},
        createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
        updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
      ],
    };

    return filterConditions;
  }

  async getCustomers(query: ListCustomersQueryDto) {
    console.log({ query });
    const { page = 1, limit = 100, sortField, sortOrder } = query;

    const filterConditions = await this.customerFilter(query);

    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const orderBy = {
      [sortField || 'createdAt']: sortOrder || 'asc',
    };

    const result = await this.prisma.customer.findMany({
      skip,
      take,
      where: {
        ...filterConditions,
      },
      orderBy,
    });

    const customers = plainToInstance(UserEntity, result);

    const totalCount = await this.prisma.customer.count({
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

  async getCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return customer;
  }

  async deleteCustomer(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return {
      message: MESSAGES.DELETED,
    };
  }

  async getCustomerStats() {
    const barredCustomerCount = await this.prisma.customer.count({
      where: {
        status: UserStatus.barred,
      },
    });

    const newCustomerCount = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: getLastNDaysDate(7),
        },
      },
    });

    const activeCustomerCount = await this.prisma.customer.count({
      where: {
        status: UserStatus.active,
      },
    });

    const totalCustomerCount = await this.prisma.customer.count();

    return {
      barredCustomerCount,
      newCustomerCount,
      activeCustomerCount,
      totalCustomerCount,
    };
  }

  async getCustomerTabs(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    const tabs = [
      {
        name: 'Customer Details',
        url: `/customers/single/${customerId}`,
      },
      {
        name: 'RgistrationHistory',
        url: `/customers/${customerId}/registration-history`,
      },
      {
        name: 'Products',
        url: `/customers/${customerId}/products`,
      },
      {
        name: 'Contracts',
        url: `/customers/${customerId}/contracts`,
      },
      {
        name: 'Transactions',
        url: `/customers/${customerId}/transactions`,
      },
      {
        name: 'Tickets',
        url: `/customers/${customerId}/tickets`,
      },
    ];

    return tabs;
  }
}
