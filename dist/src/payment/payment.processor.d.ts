import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaymentService } from './payment.service';
export declare class PaymentProcessor extends WorkerHost {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    process(job: Job<{
        trxref?: string;
        paymentData?: any;
    }>): Promise<{
        success: boolean;
        trxref: string;
        processed?: undefined;
    } | {
        processed: boolean;
        success?: undefined;
        trxref?: undefined;
    }>;
    onCompleted(): void;
}
