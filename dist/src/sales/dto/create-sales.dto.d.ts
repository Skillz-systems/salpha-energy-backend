import { CategoryTypes, PaymentMode, PaymentMethod } from '@prisma/client';
import { GuarantorDto, IdentificationDto, NextOfKinDto } from '../../contract/dto/create-contract.dto';
export declare class SaleRecipientDto {
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    email: string;
}
export declare class SaleItemDto {
    productId: string;
    quantity: number;
    paymentMode: PaymentMode;
    discount?: number;
    installmentDuration?: number;
    installmentStartingPrice?: number;
    devices: string[];
    miscellaneousPrices?: Record<string, any>;
    saleRecipient?: SaleRecipientDto;
}
export declare class CreateSalesDto {
    category: CategoryTypes;
    customerId: string;
    paymentMethod: PaymentMethod;
    bvn: string;
    applyMargin?: boolean;
    saleItems: SaleItemDto[];
    nextOfKinDetails?: NextOfKinDto;
    identificationDetails?: IdentificationDto;
    guarantorDetails?: GuarantorDto;
}
