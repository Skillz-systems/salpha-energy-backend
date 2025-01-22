import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly config: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('verify/callback')
  async verifyPayment(
    @Query('tx_ref') tx_ref: string,
    @Query('transaction_id') transaction_id: number,
    @Res() res: Response,
  ) {
    await this.paymentService.verifyPayment(transaction_id);
    return res.redirect(
      this.config.get<string>('FRONTEND_SUCCESSFUL_SALES_URL'),
    );
  }
}
