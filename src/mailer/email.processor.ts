import { MailerService } from '@nestjs-modules/mailer';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IMail } from './interfaces/mail.interface';

@Processor('emailSending')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailerService) {
    super();
  }

  async process(job: Job<IMail>) {
    try {
      const { data } = job;

      await this.mailService.sendMail({
        ...data,
      });
      
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('Completed Queue ✅');
  }
}
