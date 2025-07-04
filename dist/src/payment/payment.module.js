"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const payment_controller_1 = require("./payment.controller");
const config_1 = require("@nestjs/config");
const email_module_1 = require("../mailer/email.module");
const openpaygo_service_1 = require("../openpaygo/openpaygo.service");
const prisma_service_1 = require("../prisma/prisma.service");
const flutterwave_service_1 = require("../flutterwave/flutterwave.service");
const email_service_1 = require("../mailer/email.service");
const bullmq_1 = require("@nestjs/bullmq");
const payment_processor_1 = require("./payment.processor");
const paystack_service_1 = require("../paystack/paystack.service");
const axios_1 = require("@nestjs/axios");
const termii_service_1 = require("../termii/termii.service");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
            email_module_1.EmailModule,
            bullmq_1.BullModule.registerQueue({
                name: 'payment-queue',
            }),
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            payment_service_1.PaymentService,
            config_1.ConfigService,
            openpaygo_service_1.OpenPayGoService,
            prisma_service_1.PrismaService,
            flutterwave_service_1.FlutterwaveService,
            paystack_service_1.PaystackService,
            email_service_1.EmailService,
            payment_processor_1.PaymentProcessor,
            termii_service_1.TermiiService,
        ],
        exports: [payment_service_1.PaymentService, bullmq_1.BullModule],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map