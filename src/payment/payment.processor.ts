import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaymentService } from './payment.service';

@Processor('payment-queue')
export class PaymentProcessor extends WorkerHost {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }

  async process(job: Job<{ trxref?: string; paymentData?: any }>) {
    console.log(`[PROCESSOR] Processing job: ${job.id}, type: ${job.name}`);

    // Check job name to determine what to do
    if (job.name === 'verify-payment') {
      const { trxref } = job.data;
      console.log(`[PROCESSOR] Processing payment: ${trxref}`);

      try {
        await this.paymentService.verifyPayment(trxref);
        console.log(`[PROCESSOR] Payment verified: ${trxref}`);
        return { success: true, trxref };
      } catch (error) {
        console.error(`[PROCESSOR] Payment error: ${error.message}`);
        throw error; // Rethrow to trigger retry
      }
    } else if (job.name === 'process-cash-payment') {
      const { paymentData } = job.data;
      console.log(`[PROCESSOR] Processing cash payment: ${JSON.stringify(paymentData)}`);

      try {
        await this.paymentService.handlePostPayment(paymentData);
        console.log(`[PROCESSOR] Cash payment processed: ${JSON.stringify(paymentData)}`);
      } catch (error) {
        console.error(`[PROCESSOR] Cash payment error: ${error.message}`);
        throw error; // Rethrow to trigger retry
      }

    }

    return { processed: true };
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('Completed Payment Queue ✅');
  }
}
