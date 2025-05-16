import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

interface PaymentPayload {
  amount: number;
  email: string;
  saleId: string;
  name?: string;
  phone?: string;
  transactionRef?: string;
}

@Injectable()
export class PaystackService {
  private paystackSecretKey: string;
  private paystackBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
    );
    this.paystackBaseUrl = 'https://api.paystack.co';
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.paystackSecretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async generatePaymentLink(paymentDetails: PaymentPayload) {
    const { amount, email, saleId, transactionRef } = paymentDetails;

    const payment = await this.prisma.payment.create({
      data: {
        saleId,
        amount,
        transactionRef,
        paymentDate: new Date(),
      },
    });

    const payload = {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      reference: transactionRef,
      callback_url: this.configService.get<string>('PAYMENT_REDIRECT_URL'),
      metadata: {
        saleId,
      },
    };

    try {
      const { data } = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        payload,
        { headers: this.getAuthHeaders() },
      );

      if (!data.status) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        throw new HttpException(
          data.message || 'Failed to initialize payment',
          500,
        );
      }

      return data.data;
    } catch (error) {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        }),
        this.prisma.paymentResponses.create({
          data: {
            paymentId: payment.id,
            data: error,
          },
        }),
      ]);
      throw new Error(`Failed to generate Paystack link: ${error.message}`);
    }
  }

  async generateStaticAccount( saleId: string, email: string, bvn: string) {
    try {
      // Step 1: Create or fetch customer
      const customerPayload = {
        email,
        metadata: {
          saleId,
        },
      };

      const customerRes = await axios.post(
        `${this.paystackBaseUrl}/customer`,
        customerPayload,
        { headers: this.getAuthHeaders() },
      );

      const customer = customerRes.data.data;
      const customerCode = customer.customer_code;

      // Step 2: Generate Dedicated Account
      const accountPayload = {
        customer: customerCode,
        preferred_bank: 'wema-bank',
        bvn,
      };

      const { data } = await axios.post(
        `${this.paystackBaseUrl}/dedicated_account`,
        accountPayload,
        { headers: this.getAuthHeaders() },
      );

      if (!data.status) {
        throw new HttpException(
          data.message || 'Failed to create account',
          400,
        );
      }

      return data.data; 
    } catch (error) {
      throw new Error(
        `Failed to generate dedicated account: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const { data } = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        { headers: this.getAuthHeaders() },
      );

      if (!data.status) {
        throw new HttpException(data.message || 'Verification failed', 400);
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
  }

  async refundPayment(reference: string, amountToRefund: number) {
    try {
      const payload = {
        transaction: reference,
        amount: amountToRefund * 100, // in kobo
      };

      const { data } = await axios.post(
        `${this.paystackBaseUrl}/refund`,
        payload,
        { headers: this.getAuthHeaders() },
      );

      if (!data.status) {
        throw new HttpException(data.message || 'Refund failed', 400);
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to refund transaction: ${error.message}`);
    }
  }
}
