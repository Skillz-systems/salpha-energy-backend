import { PaymentService } from './payment.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
export declare class PaymentController {
    private readonly paymentService;
    private readonly config;
    private paymentQueue;
    constructor(paymentService: PaymentService, config: ConfigService, paymentQueue: Queue);
    verifyPayment(trxref: string): Promise<{
        message: string;
        jobId: string;
        status: string;
    } | {
        message: string;
        jobId?: undefined;
        status?: undefined;
    }>;
    getQueueStats(): Promise<{
        queueName: string;
        stats: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
        };
        recentJobs: {
            waiting: {
                id: any;
                name: any;
                data: any;
            }[];
            active: {
                id: any;
                name: any;
                data: any;
            }[];
            completed: {
                id: any;
                name: any;
                returnvalue: any;
            }[];
            failed: {
                id: any;
                name: any;
                failedReason: any;
            }[];
        };
        error?: undefined;
    } | {
        error: any;
        queueName?: undefined;
        stats?: undefined;
        recentJobs?: undefined;
    }>;
    testQueue(): Promise<{
        message: string;
        jobId: string;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
        jobId?: undefined;
    }>;
    handleWebhook(signature: string, payload: any, res: Response): Promise<void>;
}
