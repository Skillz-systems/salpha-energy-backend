import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { ActionEnum, SubjectEnum } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetSessionUser } from '../auth/decorators/getUser';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dto/create-sales.dto';
import { ValidateSaleProductDto } from './dto/validate-sale-product.dto';
import { CreateFinancialMarginDto } from './dto/create-financial-margins.dto';
import { RecordCashPaymentDto } from '../payment/dto/cash-payment.dto';
import { ListSalesQueryDto } from './dto/list-sales.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@SkipThrottle()
@ApiTags('Sales')
@Controller('sales')
@ApiBearerAuth('access_token')
@ApiHeader({
  name: 'Authorization',
  description: 'JWT token used for authentication',
  required: true,
  schema: {
    type: 'string',
    example: 'Bearer <token>',
  },
})
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    @InjectQueue('payment-queue') private paymentQueue: Queue,
  ) {}

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiBody({
    type: CreateSalesDto,
    description: 'Json structure for request payload',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Body() createSalesDto: CreateSalesDto,
    @GetSessionUser('id') requestUserId: string,
  ) {
    return await this.salesService.createSale(requestUserId, createSalesDto);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiOperation({ summary: 'Record a cash payment for a sale' })
  @ApiBody({
    type: RecordCashPaymentDto,
    description: 'Cash payment details',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.CREATED)
  @Post('record-cash-payment')
  async recordCashPayment(
    @Body() recordCashPaymentDto: RecordCashPaymentDto,
    @GetSessionUser('id') requestUserId: string,
  ) {
    try {
      
      const paymentData = await this.salesService.recordCashPayment(
        requestUserId,
        recordCashPaymentDto,
      );
      await this.paymentQueue.waitUntilReady();
      
      const job = await this.paymentQueue.add(
        'process-cash-payment',
        { paymentData },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
          delay: 1000,
        },
      );

      return {
        jobId: job.id,
        status: 'processing',
        message: 'Cash payment recorded successfully',
      };
    } catch (error) {
      console.log({ error });
      throw new BadRequestException('Payment verification failed');
    }
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiBody({
    type: ValidateSaleProductDto,
    description: 'Json structure for request payload',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @Post('validate-sale-product-quantity')
  async validateSaleProductQuantity(
    @Body() saleProducts: ValidateSaleProductDto,
  ) {
    return await this.salesService.validateSaleProductQuantity(
      saleProducts.productItems,
    );
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiBadRequestResponse({})
  @ApiExtraModels(ListSalesQueryDto)
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getSales(@Query() query: ListSalesQueryDto) {
    return await this.salesService.getAllSales(query);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @HttpCode(HttpStatus.OK)
  @Get('financial-margins')
  async getMargins() {
    return await this.salesService.getMargins();
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('financial-margins')
  async createMargins(@Body() body: CreateFinancialMarginDto) {
    return await this.salesService.createFinMargin(body);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Sale id to fetch details.',
  })
  @Get(':id')
  async getSale(@Param('id') id: string) {
    return await this.salesService.getSale(id);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Sale id to fetch payment details.',
  })
  @Get(':id/payment-data')
  async getSalePaymentData(@Param('id') id: string) {
    return await this.salesService.getSalesPaymentDetails(id);
  }
}
