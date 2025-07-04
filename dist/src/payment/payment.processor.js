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
exports.PaymentProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const payment_service_1 = require("./payment.service");
let PaymentProcessor = class PaymentProcessor extends bullmq_1.WorkerHost {
    constructor(paymentService) {
        super();
        this.paymentService = paymentService;
    }
    async process(job) {
        console.log(`[PROCESSOR] Processing job: ${job.id}, type: ${job.name}`);
        if (job.name === 'verify-payment') {
            const { trxref } = job.data;
            console.log(`[PROCESSOR] Processing payment: ${trxref}`);
            try {
                await this.paymentService.verifyPayment(trxref);
                console.log(`[PROCESSOR] Payment verified: ${trxref}`);
                return { success: true, trxref };
            }
            catch (error) {
                console.error(`[PROCESSOR] Payment error: ${error.message}`);
                throw error;
            }
        }
        else if (job.name === 'process-cash-payment') {
            const { paymentData } = job.data;
            console.log(`[PROCESSOR] Processing cash payment: ${JSON.stringify(paymentData)}`);
            try {
                await this.paymentService.handlePostPayment(paymentData);
                console.log(`[PROCESSOR] Cash payment processed: ${JSON.stringify(paymentData)}`);
            }
            catch (error) {
                console.error(`[PROCESSOR] Cash payment error: ${error.message}`);
                throw error;
            }
        }
        return { processed: true };
    }
    onCompleted() {
        console.log('Completed Payment Queue ✅');
    }
};
exports.PaymentProcessor = PaymentProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentProcessor.prototype, "onCompleted", null);
exports.PaymentProcessor = PaymentProcessor = __decorate([
    (0, bullmq_1.Processor)('payment-queue'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentProcessor);
//# sourceMappingURL=payment.processor.js.map