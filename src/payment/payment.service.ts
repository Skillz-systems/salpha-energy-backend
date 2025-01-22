import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMode, PaymentStatus } from '@prisma/client';
import { EmailService } from '../mailer/email.service';
import { ConfigService } from '@nestjs/config';
import { OpenPayGoService } from '../openpaygo/openpaygo.service';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly Email: EmailService,
    private readonly config: ConfigService,
    private readonly openPayGo: OpenPayGoService,
    private readonly flutterwaveService: FlutterwaveService,
  ) {}

  async generatePaymentLink(saleId: string, amount: number, email: string) {
    return this.flutterwaveService.generatePaymentLink({
      saleId,
      amount,
      email,
    });
  }

  async generateStaticAccount(
    saleId: string,
    monthlyPayment: number,
    email: string,
    installmentDuration: string,
    bvn: string,
  ) {
    return this.flutterwaveService.generateStaticAccount(
      saleId,
      monthlyPayment,
      email,
      installmentDuration,
      bvn,
    );
  }

  async verifyPayment(ref: number) {
    const res = await this.flutterwaveService.verifyTransaction(ref);
    const paymentData = await this.prisma.payment.update({
      where: { transactionRef: res.tx_ref },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentResponse: res,
      },
    });

    await this.handlePostPayment(paymentData);
  }

  private async handlePostPayment(paymentData: any) {
    const sale = await this.prisma.sales.findUnique({
      where: { id: paymentData.saleId },
      include: {
        saleItems: {
          include: {
            product: true,
            devices: true,
            SaleRecipient: true,
          },
        },
        customer: true,
        installmentAccountDetails: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const updatedSale = await this.prisma.sales.update({
      where: { id: sale.id },
      data: {
        totalPaid: {
          increment: paymentData.amount,
        },
      },
    });

    // Process tokenable devices
    const deviceTokens = [];
    for (const saleItem of sale.saleItems) {
      if (saleItem.product.isTokenable) {
        let tokenDuration: number;
        if (saleItem.paymentMode === PaymentMode.ONE_OFF) {
          // Generate forever token
          tokenDuration = -1; // Represents forever
        } else {
          // Calculate token duration based on payment
          const monthlyPayment =
            (saleItem.totalPrice - saleItem.installmentStartingPrice) /
            saleItem.installmentDuration;
          const monthsCovered = Math.floor(paymentData.amount / monthlyPayment);
          tokenDuration = monthsCovered * 30; // Convert months to days
        }

        // Generate and send token
        for (const device of saleItem.devices) {
          const { count: lastDeviceCount } = await this.prisma.device.findFirst(
            {
              where: {
                id: device.id,
              },
              select: {
                count: true,
              },
            },
          );
          const token = await this.openPayGo.generateToken(
            device,
            tokenDuration,
            Number(lastDeviceCount),
          );

          deviceTokens.push({
            deviceSerialNumber: device.serialNumber,
            deviceKey: device.key,
            deviceToken: token.finalToken,
          });

          await this.prisma.device.update({
            where: {
              id: device.id,
            },
            data: {
              count: String(token.newCount),
            },
          });
        }
      }
    }

    if (deviceTokens.length) {
      await this.Email.sendMail({
        to: sale.customer.email,
        from: this.config.get<string>('EMAIL_USER'),
        subject: `Here are your device tokens`,
        template: './device-tokens',
        context: {
          tokens: JSON.stringify(deviceTokens),
        },
      });
    }

    if (sale.installmentAccountDetailsId && !sale.deliveredAccountDetails) {
      await this.Email.sendMail({
        to: sale.customer.email,
        from: this.config.get<string>('EMAIL_USER'),
        subject: `Here is your account details for installment payments`,
        template: './device-tokens',
        context: {
          details: JSON.stringify(sale.installmentAccountDetails),
        },
      });

      await this.prisma.sales.update({
        where: {
          id: sale.id
        },
        data: {
          deliveredAccountDetails: true
        },
      });
    }

    return updatedSale;
  }
}
