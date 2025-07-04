import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
interface PaymentPayload {
    amount: number;
    email: string;
    saleId: string;
    name?: string;
    phone?: string;
    transactionRef?: string;
}
export declare class PaystackService {
    private readonly prisma;
    private readonly configService;
    private paystackSecretKey;
    private paystackBaseUrl;
    constructor(prisma: PrismaService, configService: ConfigService);
    private getAuthHeaders;
    generatePaymentLink(paymentDetails: PaymentPayload): Promise<any>;
    generateStaticAccount(saleId: string, email: string, bvn: string): Promise<any>;
    verifyTransaction(reference: string): Promise<any>;
    refundPayment(reference: string, amountToRefund: number): Promise<any>;
}
export {};
