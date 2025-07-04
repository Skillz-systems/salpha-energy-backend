"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const roles_module_1 = require("./roles/roles.module");
const users_module_1 = require("./users/users.module");
const permissions_module_1 = require("./permissions/permissions.module");
const prisma_module_1 = require("./prisma/prisma.module");
const email_module_1 = require("./mailer/email.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const inventory_module_1 = require("./inventory/inventory.module");
const products_module_1 = require("./products/products.module");
const agents_module_1 = require("./agents/agents.module");
const customers_module_1 = require("./customers/customers.module");
const sales_module_1 = require("./sales/sales.module");
const payment_module_1 = require("./payment/payment.module");
const device_module_1 = require("./device/device.module");
const contract_module_1 = require("./contract/contract.module");
const openpaygo_module_1 = require("./openpaygo/openpaygo.module");
const flutterwave_module_1 = require("./flutterwave/flutterwave.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const cronjobs_module_1 = require("./cronjobs/cronjobs.module");
const paystack_module_1 = require("./paystack/paystack.module");
const csv_upload_module_1 = require("./csv-upload/csv-upload.module");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const termii_module_1 = require("./termii/termii.module");
const odyssey_module_1 = require("./odyssey/odyssey.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    connection: {
                        url: configService.get('REDIS_URL'),
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 10000,
                    limit: 6,
                    blockDuration: 120000,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            email_module_1.EmailModule,
            cloudinary_module_1.CloudinaryModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            permissions_module_1.PermissionsModule,
            inventory_module_1.InventoryModule,
            products_module_1.ProductsModule,
            agents_module_1.AgentsModule,
            customers_module_1.CustomersModule,
            sales_module_1.SalesModule,
            payment_module_1.PaymentModule,
            device_module_1.DeviceModule,
            contract_module_1.ContractModule,
            openpaygo_module_1.OpenpaygoModule,
            flutterwave_module_1.FlutterwaveModule,
            cronjobs_module_1.CronjobsModule,
            termii_module_1.TermiiModule,
            paystack_module_1.PaystackModule,
            csv_upload_module_1.CsvUploadModule,
            warehouses_module_1.WarehousesModule,
            odyssey_module_1.OdysseyModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map