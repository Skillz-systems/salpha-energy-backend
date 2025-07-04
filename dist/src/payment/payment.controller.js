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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let PaymentController = class PaymentController {
    constructor(paymentService, config, paymentQueue) {
        this.paymentService = paymentService;
        this.config = config;
        this.paymentQueue = paymentQueue;
    }
    async verifyPayment(trxref) {
        try {
            if (!trxref) {
                throw new common_1.BadRequestException('txref is required');
            }
            await this.paymentQueue.waitUntilReady();
            console.log('[CONTROLLER] Queue is ready');
            const job = await this.paymentQueue.add('verify-payment', { trxref: trxref.trim() }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                delay: 1000,
            });
            console.log('[CONTROLLER] Job added successfully:', {
                jobId: job.id,
                jobName: job.name,
                jobData: job.data,
            });
            const waiting = await this.paymentQueue.getWaiting();
            const active = await this.paymentQueue.getActive();
            const completed = await this.paymentQueue.getCompleted();
            const failed = await this.paymentQueue.getFailed();
            console.log('[CONTROLLER] Queue stats:', {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
            });
            return {
                message: 'Payment verification initiated successfully',
                jobId: job.id,
                status: 'processing',
            };
        }
        catch (error) {
            console.error('[CONTROLLER] Error adding job to queue:', error);
            console.log('[CONTROLLER] Falling back to direct processing');
            try {
                await this.paymentService.verifyPayment(trxref);
                return { message: 'Payment verified directly (queue failed)' };
            }
            catch (directError) {
                console.error('[CONTROLLER] Direct processing also failed:', directError);
                throw new common_1.BadRequestException('Payment verification failed');
            }
        }
    }
    async getQueueStats() {
        try {
            await this.paymentQueue.waitUntilReady();
            const waiting = await this.paymentQueue.getWaiting();
            const active = await this.paymentQueue.getActive();
            const completed = await this.paymentQueue.getCompleted();
            const failed = await this.paymentQueue.getFailed();
            return {
                queueName: this.paymentQueue.name,
                stats: {
                    waiting: waiting.length,
                    active: active.length,
                    completed: completed.length,
                    failed: failed.length,
                },
                recentJobs: {
                    waiting: waiting
                        .slice(0, 5)
                        .map((job) => ({ id: job.id, name: job.name, data: job.data })),
                    active: active
                        .slice(0, 5)
                        .map((job) => ({ id: job.id, name: job.name, data: job.data })),
                    completed: completed
                        .slice(0, 5)
                        .map((job) => ({
                        id: job.id,
                        name: job.name,
                        returnvalue: job.returnvalue,
                    })),
                    failed: failed
                        .slice(0, 5)
                        .map((job) => ({
                        id: job.id,
                        name: job.name,
                        failedReason: job.failedReason,
                    })),
                },
            };
        }
        catch (error) {
            console.error('[DEBUG] Error getting queue stats:', error);
            return { error: error.message };
        }
    }
    async testQueue() {
        try {
            console.log('[TEST] Testing queue...');
            await this.paymentQueue.waitUntilReady();
            console.log('[TEST] Queue is ready');
            const job = await this.paymentQueue.add('test-job', { message: 'This is a test job', timestamp: new Date().toISOString() }, { removeOnComplete: false, removeOnFail: false });
            console.log('[TEST] Test job added:', job.id);
            return { message: 'Test job added', jobId: job.id };
        }
        catch (error) {
            console.error('[TEST] Error testing queue:', error);
            return { error: error.message };
        }
    }
    async handleWebhook(signature, payload, res) {
        await this.paymentService.verifyWebhookSignature(payload);
        res.status(200).end();
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify payment callback' }),
    (0, swagger_1.ApiQuery)({
        name: 'txref',
        type: String,
        description: 'Transaction reference',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('verify/callback'),
    __param(0, (0, common_1.Query)('txref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('queue/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Post)('test-queue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "testQueue", null);
__decorate([
    (0, common_1.Post)('flw-webhook'),
    __param(0, (0, common_1.Headers)('verif-hash')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)('payment'),
    __param(2, (0, bullmq_1.InjectQueue)('payment-queue')),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        config_1.ConfigService,
        bullmq_2.Queue])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map