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
var OdysseyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdysseyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OdysseyService = OdysseyService_1 = class OdysseyService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OdysseyService_1.name);
    }
    async getPayments(query) {
        try {
            const payments = await this.prisma.payment.findMany({
                where: {
                    paymentDate: {
                        gte: query.from,
                        lte: query.to,
                    },
                    paymentStatus: client_1.PaymentStatus.COMPLETED,
                    sale: {
                        id: {},
                    },
                    deletedAt: {
                        not: {},
                    },
                },
                include: {
                    sale: {
                        include: {
                            customer: true,
                            saleItems: {
                                include: {
                                    devices: true,
                                    product: true,
                                },
                            },
                            creatorDetails: true,
                        },
                    },
                },
                orderBy: {
                    paymentDate: 'asc',
                },
            });
            const odysseyPayments = [];
            for (const payment of payments) {
                const odysseyPayment = await this.transformToOdysseyFormat(payment);
                if (this.shouldIncludePayment(odysseyPayment, query)) {
                    odysseyPayments.push(odysseyPayment);
                }
            }
            console.log(`Transformed ${odysseyPayments.length} payments for Odyssey`);
            return {
                payments: odysseyPayments,
                errors: '',
            };
        }
        catch (error) {
            console.error('Error fetching payments for Odyssey', error);
            return {
                payments: [],
                errors: `Error fetching payments: ${error.message}`,
            };
        }
    }
    async validateApiToken(token) {
        try {
            const apiToken = await this.prisma.odysseyApiToken.findFirst({
                where: {
                    token,
                    isActive: true,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (apiToken) {
                await this.prisma.odysseyApiToken.update({
                    where: { id: apiToken.id },
                    data: { lastUsedAt: new Date() },
                });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error validating API token', error);
            return false;
        }
    }
    async transformToOdysseyFormat(payment) {
        const sale = payment.sale;
        const customer = sale.customer;
        const saleItem = sale.saleItems[0];
        const device = saleItem?.devices[0];
        const transactionType = this.determineTransactionType(payment, sale);
        return {
            timestamp: payment.paymentDate.toISOString(),
            amount: payment.amount,
            currency: 'NGN',
            transactionType,
            transactionId: payment.id,
            serialNumber: device?.serialNumber || 'N/A',
            customerId: customer.id,
            customerName: `${customer.firstname} ${customer.lastname}`,
            customerCategory: this.mapCustomerCategory(customer),
            meterId: device?.serialNumber || 'N/A',
            latitude: customer.latitude || '',
            longitude: customer.longitude || '',
        };
    }
    determineTransactionType(payment, sale) {
        if (sale.totalPaid >= sale.totalPrice) {
            return 'FULL_PAYMENT';
        }
        if (sale.status === 'IN_INSTALLMENT' || payment.amount < sale.totalPrice) {
            return 'INSTALLMENT_PAYMENT';
        }
        if (!sale.contractId) {
            return 'NON_CONTRACT_PAYMENT';
        }
        return 'INSTALLMENT_PAYMENT';
    }
    mapCustomerCategory(customer) {
        switch (customer.type) {
            case 'purchase':
                return 'Residential';
            case 'lead':
                return 'Prospective';
            default:
                return 'Residential';
        }
    }
    generateUtilityId(customer, sale) {
        return `UT${customer.id.slice(-6)}${sale.id.slice(-4)}`;
    }
    shouldIncludePayment(payment, query) {
        if (query.financingId && payment.financingId !== query.financingId) {
            return false;
        }
        if (query.country && !this.isInCountry(payment, query.country)) {
            return false;
        }
        if (query.siteId && !this.isInSite(payment, query.siteId)) {
            return false;
        }
        return true;
    }
    isInCountry(payment, country) {
        if (country.toLowerCase() === 'ng' || country.toLowerCase() === 'nigeria') {
            return (payment.customerPhone.startsWith('+234') || payment.currency === 'Naira');
        }
        return true;
    }
    isInSite(payment, siteId) {
        return true;
    }
    async generateApiToken(clientName, expirationDays = 365) {
        const token = this.generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);
        await this.prisma.odysseyApiToken.create({
            data: {
                token,
                clientName,
                expiresAt,
                isActive: true,
                createdAt: new Date(),
            },
        });
        console.log(`Generated new API token for client: ${clientName}`);
        return token;
    }
    generateSecureToken() {
        const chars = '0123456789abcdef';
        let token = '';
        for (let i = 0; i < 64; i++) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
        return token;
    }
    async revokeApiToken(token) {
        try {
            const result = await this.prisma.odysseyApiToken.updateMany({
                where: { token },
                data: { isActive: false },
            });
            return result.count > 0;
        }
        catch (error) {
            console.error('Error revoking API token', error);
            return false;
        }
    }
    async listActiveTokens() {
        return await this.prisma.odysseyApiToken.findMany({
            where: { isActive: true },
            select: {
                id: true,
                clientName: true,
                createdAt: true,
                expiresAt: true,
                lastUsedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OdysseyService = OdysseyService;
exports.OdysseyService = OdysseyService = OdysseyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OdysseyService);
//# sourceMappingURL=odyssey.service.js.map