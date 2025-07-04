"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
const Flutterwave = require("flutterwave-node-v3");
const client_1 = require("@prisma/client");
let FlutterwaveService = class FlutterwaveService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.flw = new Flutterwave(this.configService.get('FLW_PUBLIC_KEY'), this.configService.get('FLW_SECRET_KEY'));
        this.flwBaseUrl = 'https://api.flutterwave.com/v3';
    }
    async generatePaymentLink(paymentDetails) {
        const { amount, email, saleId, transactionRef } = paymentDetails;
        const payload = {
            amount,
            tx_ref: transactionRef,
            currency: 'NGN',
            enckey: this.configService.get('FLW_ENCRYPTION_KEY'),
            customer: {
                email,
            },
            payment_options: 'banktransfer',
            customizations: {
                title: 'Product Purchase',
                description: `Payment for sale ${saleId}`,
                logo: this.configService.get('COMPANY_LOGO_URL'),
            },
            redirect_url: this.configService.get('PAYMENT_REDIRECT_URL'),
            meta: {
                saleId,
            },
        };
        const payment = await this.prisma.payment.create({
            data: {
                saleId,
                amount,
                transactionRef,
                paymentDate: new Date(),
            },
        });
        const url = `${this.flwBaseUrl}/payments`;
        try {
            const { data } = await axios_1.default.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${this.configService.get('FLW_SECRET_KEY')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (data.status !== 'success') {
                await this.prisma.$transaction([
                    this.prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            paymentStatus: client_1.PaymentStatus.FAILED,
                        },
                    }),
                    this.prisma.paymentResponses.create({
                        data: {
                            paymentId: payment.id,
                            data,
                        },
                    }),
                ]);
                throw new common_1.HttpException(`Payment link not generated ${data.message}`, 500);
            }
            return data.data;
        }
        catch (error) {
            await this.prisma.$transaction([
                this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        paymentStatus: client_1.PaymentStatus.FAILED,
                    },
                }),
                this.prisma.paymentResponses.create({
                    data: {
                        paymentId: payment.id,
                        data: error,
                    },
                }),
            ]);
            throw new Error(`Failed to generate payment link: ${error.message}`);
        }
    }
    async generateStaticAccount(saleId, email, bvn, transactionRef) {
        try {
            const payload = {
                tx_ref: transactionRef,
                bvn,
                is_permanent: true,
                narration: `Please make a bank transfer for the installment payment of sale ${saleId}`,
                email,
            };
            const response = await this.flw.VirtualAcct.create(payload);
            if (response.status !== 'success') {
                throw new common_1.HttpException(response.message || 'Failed to generate virtual account', 400);
            }
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to generate static account: ${error.message}`);
        }
    }
    async verifyTransaction(transactionId) {
        try {
            const response = await this.flw.Transaction.verify({ id: transactionId });
            if (response.status !== 'success' && response.status !== 'completed') {
                throw new common_1.HttpException(response.message || 'Failed to verify transaction', 400);
            }
            return response;
        }
        catch (error) {
            throw new Error(`Failed to verify transaction: ${error.message}`);
        }
    }
    async refundPayment(transactionId, amountToRefund) {
        try {
            const response = await this.flw.Transaction.refund({
                id: transactionId,
                amount: amountToRefund,
            });
            if (response.status !== 'success' && response.status !== 'completed') {
                throw new common_1.HttpException(response.message || 'Failed to perform refund', 400);
            }
            return response;
        }
        catch (error) {
            throw new Error(`Failed to verify transaction: ${error.message}`);
        }
    }
};
exports.FlutterwaveService = FlutterwaveService;
exports.FlutterwaveService = FlutterwaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], FlutterwaveService);
//# sourceMappingURL=flutterwave.service.js.map