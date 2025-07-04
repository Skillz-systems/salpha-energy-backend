"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const sales_controller_1 = require("./sales.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const payment_service_1 = require("../payment/payment.service");
const contract_service_1 = require("../contract/contract.service");
const email_service_1 = require("../mailer/email.service");
const openpaygo_service_1 = require("../openpaygo/openpaygo.service");
const flutterwave_service_1 = require("../flutterwave/flutterwave.service");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const paystack_service_1 = require("../paystack/paystack.service");
const termii_service_1 = require("../termii/termii.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const bullmq_1 = require("@nestjs/bullmq");
const payment_processor_1 = require("../payment/payment.processor");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
            cloudinary_module_1.CloudinaryModule,
            bullmq_1.BullModule.registerQueue({
                name: 'payment-queue',
            }),
        ],
        controllers: [sales_controller_1.SalesController],
        providers: [
            sales_service_1.SalesService,
            prisma_service_1.PrismaService,
            payment_service_1.PaymentService,
            openpaygo_service_1.OpenPayGoService,
            contract_service_1.ContractService,
            email_service_1.EmailService,
            flutterwave_service_1.FlutterwaveService,
            paystack_service_1.PaystackService,
            termii_service_1.TermiiService,
            payment_processor_1.PaymentProcessor,
            config_1.ConfigService,
        ],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map