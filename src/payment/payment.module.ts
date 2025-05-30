import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../mailer/email.module';
import { OpenPayGoService } from '../openpaygo/openpaygo.service';
import { PrismaService } from '../prisma/prisma.service';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';
import { EmailService } from '../mailer/email.service';
import { BullModule } from '@nestjs/bullmq';
import { PaymentProcessor } from './payment.processor';
import { PaystackService } from '../paystack/paystack.service';

@Module({
  imports: [
    EmailModule,
    BullModule.registerQueue({
      name: 'payment-queue',
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ConfigService,
    OpenPayGoService,
    PrismaService,
    FlutterwaveService,
    PaystackService,
    EmailService,
    PaymentProcessor,
  ],
  exports: [PaymentService, BullModule],
})
export class PaymentModule {}
