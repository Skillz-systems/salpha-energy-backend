import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { User } from '@prisma/client';
import { UserEntity } from '../users/entity/user.entity';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomersDto: CreateCustomerDto, requestUserId: string): Promise<{
        message: string;
    }>;
    listCustomers(query: ListCustomersQueryDto): Promise<{
        customers: UserEntity[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    fetchUser(id: string): Promise<User>;
    deleteUser(id: string): Promise<{
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
