import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { IMail } from './interfaces/mail.interface';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('emailSending') private emailQueue: Queue) {}

  async sendMail(value: IMail) {
    try {
      // console.log(value);
      await this.emailQueue.add("addNewUser", value);
    } catch (error) {
      console.log(error);
    }
  }
}
