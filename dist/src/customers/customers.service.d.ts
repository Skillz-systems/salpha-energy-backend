import { CreateCustomerDto } from './dto/create-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserEntity } from '../users/entity/user.entity';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCustomer(requestUserId: string, createCustomerDto: CreateCustomerDto): Promise<{
        message: string;
    }>;
    customerFilter(query: ListCustomersQueryDto): Promise<Prisma.CustomerWhereInput>;
    getCustomers(query: ListCustomersQueryDto): Promise<{
        customers: UserEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    getCustomer(id: string): Promise<{
        createdAt: Date;
        type: import("@prisma/client").$Enums.CustomerType;
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        location: string | null;
        id: string;
        addressType: import("@prisma/client").$Enums.AddressType;
        longitude: string | null;
        latitude: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        updatedAt: Date;
        deletedAt: Date | null;
        creatorId: string | null;
        agentId: string | null;
    }>;
    deleteCustomer(id: string): Promise<{
        message: string;
    }>;
    getCustomerStats(): Promise<{
        barredCustomerCount: number;
        newCustomerCount: number;
        activeCustomerCount: number;
        totalCustomerCount: number;
    }>;
    getCustomerTabs(customerId: string): Promise<{
        name: string;
        url: string;
    }[]>;
}
