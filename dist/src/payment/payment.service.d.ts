import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
import { EmailService } from '../mailer/email.service';
import { ConfigService } from '@nestjs/config';
import { OpenPayGoService } from '../openpaygo/openpaygo.service';
import { PaystackService } from '../paystack/paystack.service';
import { TermiiService } from '../termii/termii.service';
export declare class PaymentService {
    private readonly prisma;
    private readonly Email;
    private readonly config;
    private readonly openPayGo;
    private readonly paystackService;
    private readonly termiiService;
    constructor(prisma: PrismaService, Email: EmailService, config: ConfigService, openPayGo: OpenPayGoService, paystackService: PaystackService, termiiService: TermiiService);
    generatePaymentLink(saleId: string, amount: number, email: string, transactionRef: string): Promise<any>;
    generatePaymentPayload(saleId: string, amount: number, email: string, transactionRef: string, type?: PaymentMethod): Promise<{
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
    generateStaticAccount(saleId: string, email: string, bvn: string): Promise<any>;
    verifyPayment(ref: string | number): Promise<string>;
    handlePostPayment(paymentData: any): Promise<{
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
    }>;
    private formatInstallmentAccountMessage;
    verifyWebhookSignature(payload: any): Promise<void>;
}
