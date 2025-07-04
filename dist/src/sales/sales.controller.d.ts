import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dto/create-sales.dto';
import { ValidateSaleProductDto } from './dto/validate-sale-product.dto';
import { CreateFinancialMarginDto } from './dto/create-financial-margins.dto';
import { RecordCashPaymentDto } from '../payment/dto/cash-payment.dto';
import { ListSalesQueryDto } from './dto/list-sales.dto';
import { Queue } from 'bullmq';
export declare class SalesController {
    private readonly salesService;
    private paymentQueue;
    constructor(salesService: SalesService, paymentQueue: Queue);
    create(createSalesDto: CreateSalesDto, requestUserId: string): Promise<{
        sale: {
            saleItems: ({
                product: {
                    createdAt: Date;
                    name: string;
                    description: string | null;
                    id: string;
                    updatedAt: Date;
                    image: string | null;
                    creatorId: string | null;
                    currency: string | null;
                    paymentModes: string | null;
                    categoryId: string;
                };
                devices: {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    count: string | null;
                    serialNumber: string;
                    key: string;
                    startingCode: string | null;
                    timeDivider: string | null;
                    restrictedDigitMode: boolean;
                    hardwareModel: string | null;
                    firmwareVersion: string | null;
                    isTokenable: boolean;
                    isUsed: boolean;
                    saleItemIDs: string[];
                }[];
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                quantity: number;
                productId: string;
                paymentMode: import("@prisma/client").$Enums.PaymentMode;
                discount: number | null;
                installmentDuration: number | null;
                installmentStartingPrice: number | null;
                miscellaneousPrices: import("@prisma/client/runtime/library").JsonValue | null;
                totalPrice: number;
                saleId: string;
                monthlyPayment: number | null;
                saleRecipientId: string | null;
                deviceIDs: string[];
            })[];
        } & {
            createdAt: Date;
            category: import("@prisma/client").$Enums.CategoryTypes;
            id: string;
            status: import("@prisma/client").$Enums.SalesStatus;
            updatedAt: Date;
            deletedAt: Date | null;
            creatorId: string | null;
            installmentStartingPrice: number;
            customerId: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            applyMargin: boolean;
            totalPrice: number;
            totalPaid: number;
            totalMonthlyPayment: number;
            totalInstallmentDuration: number;
            installmentAccountDetailsId: string | null;
            deliveredAccountDetails: boolean;
            contractId: string | null;
            transactionDate: Date | null;
        };
        financialMargins: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            outrightMargin: number;
            loanMargin: number;
            monthlyInterest: number;
        };
        paymentData: {
            amount: number;
            tx_ref: string;
            currency: string;
            customer: {
                email: string;
            };
            payment_options: string;
            customizations: {
                title: string;
                description: string;
                logo: string;
            };
            meta: {
                saleId: string;
            };
        };
    }>;
    recordCashPayment(recordCashPaymentDto: RecordCashPaymentDto, requestUserId: string): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    validateSaleProductQuantity(saleProducts: ValidateSaleProductDto): Promise<{
        message: string;
        success: boolean;
        validationDetails: any[];
    }>;
    getSales(query: ListSalesQueryDto): Promise<{
        saleItems: ({
            product: {
                createdAt: Date;
                name: string;
                description: string | null;
                id: string;
                updatedAt: Date;
                image: string | null;
                creatorId: string | null;
                currency: string | null;
                paymentModes: string | null;
                categoryId: string;
            };
            devices: {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                count: string | null;
                serialNumber: string;
                key: string;
                startingCode: string | null;
                timeDivider: string | null;
                restrictedDigitMode: boolean;
                hardwareModel: string | null;
                firmwareVersion: string | null;
                isTokenable: boolean;
                isUsed: boolean;
                saleItemIDs: string[];
            }[];
            sale: {
                customer: {
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
                };
                payment: ({
                    recordedBy: {
                        firstname: string;
                        lastname: string;
                        id: string;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                    saleId: string;
                    amount: number;
                    transactionRef: string;
                    paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                    paymentDate: Date;
                    recordedById: string | null;
                    notes: string | null;
                })[];
            } & {
                createdAt: Date;
                category: import("@prisma/client").$Enums.CategoryTypes;
                id: string;
                status: import("@prisma/client").$Enums.SalesStatus;
                updatedAt: Date;
                deletedAt: Date | null;
                creatorId: string | null;
                installmentStartingPrice: number;
                customerId: string;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                applyMargin: boolean;
                totalPrice: number;
                totalPaid: number;
                totalMonthlyPayment: number;
                totalInstallmentDuration: number;
                installmentAccountDetailsId: string | null;
                deliveredAccountDetails: boolean;
                contractId: string | null;
                transactionDate: Date | null;
            };
            SaleRecipient: {
                createdAt: Date;
                firstname: string;
                lastname: string;
                email: string;
                phone: string;
                id: string;
                updatedAt: Date;
                address: string;
            };
        } & {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            quantity: number;
            productId: string;
            paymentMode: import("@prisma/client").$Enums.PaymentMode;
            discount: number | null;
            installmentDuration: number | null;
            installmentStartingPrice: number | null;
            miscellaneousPrices: import("@prisma/client/runtime/library").JsonValue | null;
            totalPrice: number;
            saleId: string;
            monthlyPayment: number | null;
            saleRecipientId: string | null;
            deviceIDs: string[];
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMargins(): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        outrightMargin: number;
        loanMargin: number;
        monthlyInterest: number;
    }>;
    createMargins(body: CreateFinancialMarginDto): Promise<void>;
    getSale(id: string): Promise<BadRequestException | ({
        product: {
            inventories: ({
                inventory: {
                    createdAt: Date;
                    name: string;
                    id: string;
                    status: import("@prisma/client").$Enums.InventoryStatus;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    image: string | null;
                    manufacturerName: string;
                    dateOfManufacture: string | null;
                    sku: string | null;
                    class: import("@prisma/client").$Enums.InventoryClass;
                    inventoryCategoryId: string | null;
                    inventorySubCategoryId: string | null;
                };
            } & {
                id: string;
                inventoryId: string;
                quantity: number;
                productId: string;
            })[];
        } & {
            createdAt: Date;
            name: string;
            description: string | null;
            id: string;
            updatedAt: Date;
            image: string | null;
            creatorId: string | null;
            currency: string | null;
            paymentModes: string | null;
            categoryId: string;
        };
        devices: ({
            tokens: {
                createdAt: Date;
                id: string;
                token: string;
                duration: number;
                deviceId: string | null;
            }[];
        } & {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            count: string | null;
            serialNumber: string;
            key: string;
            startingCode: string | null;
            timeDivider: string | null;
            restrictedDigitMode: boolean;
            hardwareModel: string | null;
            firmwareVersion: string | null;
            isTokenable: boolean;
            isUsed: boolean;
            saleItemIDs: string[];
        })[];
        sale: {
            customer: {
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
            };
            payment: {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                deletedAt: Date | null;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                saleId: string;
                amount: number;
                transactionRef: string;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                paymentDate: Date;
                recordedById: string | null;
                notes: string | null;
            }[];
            installmentAccountDetails: {
                createdAt: Date;
                id: string;
                amount: string;
                flw_ref: string;
                order_ref: string;
                account_number: string;
                account_status: string;
                frequency: number;
                bank_name: string;
                expiry_date: string;
                note: string;
            };
        } & {
            createdAt: Date;
            category: import("@prisma/client").$Enums.CategoryTypes;
            id: string;
            status: import("@prisma/client").$Enums.SalesStatus;
            updatedAt: Date;
            deletedAt: Date | null;
            creatorId: string | null;
            installmentStartingPrice: number;
            customerId: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            applyMargin: boolean;
            totalPrice: number;
            totalPaid: number;
            totalMonthlyPayment: number;
            totalInstallmentDuration: number;
            installmentAccountDetailsId: string | null;
            deliveredAccountDetails: boolean;
            contractId: string | null;
            transactionDate: Date | null;
        };
        SaleRecipient: {
            createdAt: Date;
            firstname: string;
            lastname: string;
            email: string;
            phone: string;
            id: string;
            updatedAt: Date;
            address: string;
        };
    } & {
        createdAt: Date;
        id: string;
        updatedAt: Date;
        quantity: number;
        productId: string;
        paymentMode: import("@prisma/client").$Enums.PaymentMode;
        discount: number | null;
        installmentDuration: number | null;
        installmentStartingPrice: number | null;
        miscellaneousPrices: import("@prisma/client/runtime/library").JsonValue | null;
        totalPrice: number;
        saleId: string;
        monthlyPayment: number | null;
        saleRecipientId: string | null;
        deviceIDs: string[];
    })>;
    getSalePaymentData(id: string): Promise<{
        sale: {
            saleItems: ({
                product: {
                    createdAt: Date;
                    name: string;
                    description: string | null;
                    id: string;
                    updatedAt: Date;
                    image: string | null;
                    creatorId: string | null;
                    currency: string | null;
                    paymentModes: string | null;
                    categoryId: string;
                };
                devices: {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    count: string | null;
                    serialNumber: string;
                    key: string;
                    startingCode: string | null;
                    timeDivider: string | null;
                    restrictedDigitMode: boolean;
                    hardwareModel: string | null;
                    firmwareVersion: string | null;
                    isTokenable: boolean;
                    isUsed: boolean;
                    saleItemIDs: string[];
                }[];
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                quantity: number;
                productId: string;
                paymentMode: import("@prisma/client").$Enums.PaymentMode;
                discount: number | null;
                installmentDuration: number | null;
                installmentStartingPrice: number | null;
                miscellaneousPrices: import("@prisma/client/runtime/library").JsonValue | null;
                totalPrice: number;
                saleId: string;
                monthlyPayment: number | null;
                saleRecipientId: string | null;
                deviceIDs: string[];
            })[];
        } & {
            createdAt: Date;
            category: import("@prisma/client").$Enums.CategoryTypes;
            id: string;
            status: import("@prisma/client").$Enums.SalesStatus;
            updatedAt: Date;
            deletedAt: Date | null;
            creatorId: string | null;
            installmentStartingPrice: number;
            customerId: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            applyMargin: boolean;
            totalPrice: number;
            totalPaid: number;
            totalMonthlyPayment: number;
            totalInstallmentDuration: number;
            installmentAccountDetailsId: string | null;
            deliveredAccountDetails: boolean;
            contractId: string | null;
            transactionDate: Date | null;
        };
        financialMargins: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            outrightMargin: number;
            loanMargin: number;
            monthlyInterest: number;
        };
        paymentData: {
            amount: number;
            tx_ref: string;
            currency: string;
            customer: {
                email: string;
            };
            payment_options: string;
            customizations: {
                title: string;
                description: string;
                logo: string;
            };
            meta: {
                saleId: string;
            };
        };
    }>;
}
