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
export declare class FlutterwaveService {
    private readonly prisma;
    private readonly configService;
    private flw;
    private flwBaseUrl;
    constructor(prisma: PrismaService, configService: ConfigService);
    generatePaymentLink(paymentDetails: PaymentPayload): Promise<any>;
    generateStaticAccount(saleId: string, email: string, bvn: string, transactionRef: string): Promise<any>;
    verifyTransaction(transactionId: number): Promise<any>;
    refundPayment(transactionId: number, amountToRefund: number): Promise<any>;
}
export {};
