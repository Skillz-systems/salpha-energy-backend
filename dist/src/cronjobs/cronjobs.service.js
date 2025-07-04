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
var CronjobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronjobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CronjobsService = CronjobsService_1 = class CronjobsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CronjobsService_1.name);
    }
    async checkUnpaidSales() {
        this.logger.log('Running cron job to check unpaid sales...');
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const unpaidSales = await this.prisma.sales.findMany({
            where: { status: client_1.SalesStatus.UNPAID, createdAt: { lte: sixHoursAgo } },
            include: { saleItems: true, batchAllocations: true },
        });
        for (const sale of unpaidSales) {
            this.logger.log(`Restoring inventory for Sale ID: ${sale.id}`);
            if (!sale.batchAllocations.length) {
                this.logger.log(`Batch Allocations not found Sale ID: ${sale.id}`);
                continue;
            }
            for (const { inventoryBatchId: id, quantity } of sale.batchAllocations) {
                await this.prisma.inventoryBatch.update({
                    where: { id },
                    data: {
                        remainingQuantity: {
                            increment: quantity,
                        },
                    },
                });
            }
            await this.prisma.sales.update({
                where: { id: sale.id },
                data: { status: client_1.SalesStatus.CANCELLED },
            });
            await this.prisma.payment.update({
                where: {
                    id: sale.id,
                },
                data: { paymentStatus: client_1.PaymentStatus.FAILED },
            });
            this.logger.log(`Inventory Restration for Sale ID: ${sale.id} successful`);
        }
    }
};
exports.CronjobsService = CronjobsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS, {
        name: 'checkUnpaidSales',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronjobsService.prototype, "checkUnpaidSales", null);
exports.CronjobsService = CronjobsService = CronjobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CronjobsService);
//# sourceMappingURL=cronjobs.service.js.map