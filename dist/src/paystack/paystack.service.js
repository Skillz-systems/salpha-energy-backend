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
exports.PaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaystackService = class PaystackService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.paystackSecretKey = this.configService.get('PAYSTACK_SECRET_KEY');
        this.paystackBaseUrl = 'https://api.paystack.co';
    }
    getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
        };
    }
    async generatePaymentLink(paymentDetails) {
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
            amount: amount * 100,
            reference: transactionRef,
            callback_url: this.configService.get('PAYMENT_REDIRECT_URL'),
            metadata: {
                saleId,
            },
        };
        try {
            const { data } = await axios_1.default.post(`${this.paystackBaseUrl}/transaction/initialize`, payload, { headers: this.getAuthHeaders() });
            if (!data.status) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { paymentStatus: client_1.PaymentStatus.FAILED },
                });
                throw new common_1.HttpException(data.message || 'Failed to initialize payment', 500);
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
            throw new Error(`Failed to generate Paystack link: ${error.message}`);
        }
    }
    async generateStaticAccount(saleId, email, bvn) {
        try {
            const customerPayload = {
                email,
                metadata: {
                    saleId,
                },
            };
            const customerRes = await axios_1.default.post(`${this.paystackBaseUrl}/customer`, customerPayload, { headers: this.getAuthHeaders() });
            const customer = customerRes.data.data;
            const customerCode = customer.customer_code;
            const accountPayload = {
                customer: customerCode,
                preferred_bank: 'wema-bank',
                bvn,
            };
            const { data } = await axios_1.default.post(`${this.paystackBaseUrl}/dedicated_account`, accountPayload, { headers: this.getAuthHeaders() });
            if (!data.status) {
                throw new common_1.HttpException(data.message || 'Failed to create account', 400);
            }
            return data.data;
        }
        catch (error) {
            throw new Error(`Failed to generate dedicated account: ${error.response?.data?.message || error.message}`);
        }
    }
    async verifyTransaction(reference) {
        try {
            const { data } = await axios_1.default.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, { headers: this.getAuthHeaders() });
            if (!data.status) {
                throw new common_1.HttpException(data.message || 'Verification failed', 400);
            }
            return data.data;
        }
        catch (error) {
            throw new Error(`Failed to verify transaction: ${error.message}`);
        }
    }
    async refundPayment(reference, amountToRefund) {
        try {
            const payload = {
                transaction: reference,
                amount: amountToRefund * 100,
            };
            const { data } = await axios_1.default.post(`${this.paystackBaseUrl}/refund`, payload, { headers: this.getAuthHeaders() });
            if (!data.status) {
                throw new common_1.HttpException(data.message || 'Refund failed', 400);
            }
            return data.data;
        }
        catch (error) {
            throw new Error(`Failed to refund transaction: ${error.message}`);
        }
    }
};
exports.PaystackService = PaystackService;
exports.PaystackService = PaystackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaystackService);
//# sourceMappingURL=paystack.service.js.map