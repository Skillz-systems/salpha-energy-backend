import { AddressType } from '@prisma/client';
export declare class CreateCustomerDto {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    addressType: AddressType;
    location: string;
    longitude?: string;
    latitude?: string;
}
