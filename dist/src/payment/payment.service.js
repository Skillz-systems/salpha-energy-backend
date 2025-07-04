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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const email_service_1 = require("../mailer/email.service");
const config_1 = require("@nestjs/config");
const openpaygo_service_1 = require("../openpaygo/openpaygo.service");
const paystack_service_1 = require("../paystack/paystack.service");
const termii_service_1 = require("../termii/termii.service");
let PaymentService = class PaymentService {
    constructor(prisma, Email, config, openPayGo, paystackService, termiiService) {
        this.prisma = prisma;
        this.Email = Email;
        this.config = config;
        this.openPayGo = openPayGo;
        this.paystackService = paystackService;
        this.termiiService = termiiService;
    }
    async generatePaymentLink(saleId, amount, email, transactionRef) {
        return this.paystackService.generatePaymentLink({
            saleId,
            amount,
            email,
            transactionRef,
        });
    }
    async generatePaymentPayload(saleId, amount, email, transactionRef, type = client_1.PaymentMethod.ONLINE) {
        if (type === client_1.PaymentMethod.ONLINE) {
            await this.prisma.payment.create({
                data: {
                    saleId,
                    amount,
                    transactionRef,
                    paymentDate: new Date(),
                },
            });
        }
        const sale = await this.prisma.sales.findFirst({
            where: {
                id: saleId,
            },
            include: {
                saleItems: {
                    include: {
                        product: true,
                        devices: true,
                    },
                },
            },
        });
        const financialMargins = await this.prisma.financialSettings.findFirst();
        return {
            sale,
            financialMargins,
            paymentData: {
                amount,
                tx_ref: transactionRef,
                currency: type === client_1.PaymentMethod.ONLINE ? 'NGN' : undefined,
                customer: {
                    email,
                },
                payment_options: type === client_1.PaymentMethod.ONLINE ? 'banktransfer' : undefined,
                customizations: {
                    title: 'Product Purchase',
                    description: `Payment for sale ${saleId}`,
                    logo: this.config.get('COMPANY_LOGO_URL'),
                },
                meta: {
                    saleId,
                },
            },
        };
    }
    async generateStaticAccount(saleId, email, bvn) {
        return this.paystackService.generateStaticAccount(saleId, email, bvn);
    }
    async verifyPayment(ref) {
        console.log({ ref });
        const paymentExist = await this.prisma.payment.findFirst({
            where: {
                transactionRef: ref,
            },
            include: {
                sale: true,
            },
        });
        if (!paymentExist)
            throw new common_1.BadRequestException(`Payment with ref: ${ref} does not exist.`);
        if (paymentExist.paymentMethod === client_1.PaymentMethod.CASH) {
            throw new common_1.BadRequestException('Cash payments cannot be verified through this endpoint');
        }
        const res = await this.paystackService.verifyTransaction(ref);
        if (paymentExist.paymentStatus === client_1.PaymentStatus.FAILED &&
            paymentExist.sale.status === client_1.SalesStatus.CANCELLED) {
            const refundResponse = await this.paystackService.refundPayment(ref, res.data.charged_amount);
            await this.prisma.$transaction([
                this.prisma.payment.update({
                    where: { id: paymentExist.id },
                    data: {
                        paymentStatus: client_1.PaymentStatus.REFUNDED,
                    },
                }),
                this.prisma.paymentResponses.create({
                    data: {
                        paymentId: paymentExist.id,
                        data: refundResponse,
                    },
                }),
            ]);
            throw new common_1.BadRequestException('This sale is cancelled already. Refund Initialised!');
        }
        if (paymentExist.paymentStatus !== client_1.PaymentStatus.COMPLETED) {
            const [paymentData] = await this.prisma.$transaction([
                this.prisma.payment.update({
                    where: { id: paymentExist.id },
                    data: {
                        paymentStatus: client_1.PaymentStatus.COMPLETED,
                    },
                }),
                this.prisma.paymentResponses.create({
                    data: {
                        paymentId: paymentExist.id,
                        data: res,
                    },
                }),
            ]);
            await this.handlePostPayment(paymentData);
        }
        return 'success';
    }
    async handlePostPayment(paymentData) {
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
            throw new common_1.NotFoundException('Sale not found');
        }
        const updatedSale = await this.prisma.sales.update({
            where: { id: sale.id },
            data: {
                totalPaid: {
                    increment: paymentData.amount,
                },
                status: sale.totalPaid + paymentData.amount >= sale.totalPrice
                    ? client_1.SalesStatus.COMPLETED
                    : client_1.SalesStatus.IN_INSTALLMENT,
            },
        });
        const deviceTokens = [];
        for (const saleItem of sale.saleItems) {
            const saleDevices = saleItem.devices;
            const tokenableDevices = saleDevices.filter((device) => device.isTokenable);
            if (tokenableDevices.length) {
                let tokenDuration;
                if (saleItem.paymentMode === client_1.PaymentMode.ONE_OFF) {
                    tokenDuration = -1;
                }
                else {
                    const monthlyPayment = (saleItem.totalPrice - saleItem.installmentStartingPrice) /
                        saleItem.installmentDuration;
                    const monthsCovered = Math.floor(paymentData.amount / monthlyPayment);
                    tokenDuration = Math.floor(monthsCovered * 30);
                }
                if (tokenDuration > 0 || tokenDuration === -1) {
                    for (const device of tokenableDevices) {
                        const token = await this.openPayGo.generateToken(device, tokenDuration, Number(device.count));
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
                        await this.prisma.tokens.create({
                            data: {
                                deviceId: device.id,
                                token: String(token.finalToken),
                                duration: tokenDuration,
                            },
                        });
                    }
                }
            }
        }
        console.log({ deviceTokens });
        if (deviceTokens.length) {
            await this.Email.sendMail({
                to: sale.customer.email,
                from: this.config.get('MAIL_FROM'),
                subject: `Here are your device tokens`,
                template: './device-tokens',
                context: {
                    tokens: JSON.stringify(deviceTokens, undefined, 4),
                },
            });
        }
        if (sale.customer.phone) {
            try {
                await this.termiiService.sendDeviceTokensSms(sale.customer.phone, deviceTokens, sale.customer.firstname || sale.customer.lastname);
                console.log('Device tokens SMS sent successfully');
            }
            catch (error) {
                console.error('Failed to send device tokens SMS:', error);
            }
        }
        else {
            console.warn('Customer phone number not available for SMS');
        }
        if (sale.paymentMethod === client_1.PaymentMethod.ONLINE &&
            sale.installmentAccountDetailsId &&
            !sale.deliveredAccountDetails) {
            await this.Email.sendMail({
                to: sale.customer.email,
                from: this.config.get('MAIL_FROM'),
                subject: `Here is your account details for installment payments`,
                template: './installment-account-details',
                context: {
                    details: JSON.stringify(sale.installmentAccountDetails, undefined, 4),
                },
            });
            if (sale.customer.phone) {
                try {
                    const accountMessage = this.formatInstallmentAccountMessage(sale.installmentAccountDetails, sale.customer.firstname || sale.customer.lastname);
                    await this.termiiService.sendSms({
                        to: sale.customer.phone,
                        message: accountMessage,
                    });
                    console.log('Installment account details SMS sent successfully');
                }
                catch (error) {
                    console.error('Failed to send installment account details SMS:', error);
                }
            }
            await this.prisma.sales.update({
                where: {
                    id: sale.id,
                },
                data: {
                    deliveredAccountDetails: true,
                },
            });
        }
        return updatedSale;
    }
    formatInstallmentAccountMessage(accountDetails, customerName) {
        const greeting = customerName ? `Dear ${customerName},` : 'Dear Customer,';
        let message = `${greeting}\n\nYour installment payment details:\n\n`;
        message += `Bank: ${accountDetails.bankName}\n`;
        message += `Account: ${accountDetails.accountNumber}\n`;
        message += `Name: ${accountDetails.accountName}\n\n`;
        message += `Use these details for monthly payments.\n\nThank you!`;
        return message;
    }
    async verifyWebhookSignature(payload) {
        const txRef = payload?.data?.tx_ref;
        const status = payload?.data?.status;
        if (!txRef || status !== 'successful') {
            console.error('Invalid webhook payload:', payload);
            return;
        }
        const paymentExist = await this.prisma.payment.findUnique({
            where: { transactionRef: txRef },
        });
        if (!paymentExist) {
            console.warn(`Payment not found for txRef: ${txRef}`);
            return;
        }
        await this.prisma.$transaction([
            this.prisma.paymentResponses.create({
                data: {
                    paymentId: paymentExist.id,
                    data: payload,
                },
            }),
        ]);
        console.log(`Payment updated successfully for txRef: ${txRef}`);
        console.log({ payload });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService,
        openpaygo_service_1.OpenPayGoService,
        paystack_service_1.PaystackService,
        termii_service_1.TermiiService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map