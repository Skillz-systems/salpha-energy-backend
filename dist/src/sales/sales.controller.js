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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const getUser_1 = require("../auth/decorators/getUser");
const sales_service_1 = require("./sales.service");
const create_sales_dto_1 = require("./dto/create-sales.dto");
const validate_sale_product_dto_1 = require("./dto/validate-sale-product.dto");
const create_financial_margins_dto_1 = require("./dto/create-financial-margins.dto");
const cash_payment_dto_1 = require("../payment/dto/cash-payment.dto");
const list_sales_dto_1 = require("./dto/list-sales.dto");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let SalesController = class SalesController {
    constructor(salesService, paymentQueue) {
        this.salesService = salesService;
        this.paymentQueue = paymentQueue;
    }
    async create(createSalesDto, requestUserId) {
        return await this.salesService.createSale(requestUserId, createSalesDto);
    }
    async recordCashPayment(recordCashPaymentDto, requestUserId) {
        try {
            const paymentData = await this.salesService.recordCashPayment(requestUserId, recordCashPaymentDto);
            await this.paymentQueue.waitUntilReady();
            const job = await this.paymentQueue.add('process-cash-payment', { paymentData }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                delay: 1000,
            });
            return {
                jobId: job.id,
                status: 'processing',
                message: 'Cash payment recorded successfully',
            };
        }
        catch (error) {
            console.log({ error });
            throw new common_1.BadRequestException('Payment verification failed');
        }
    }
    async validateSaleProductQuantity(saleProducts) {
        return await this.salesService.validateSaleProductQuantity(saleProducts.productItems);
    }
    async getSales(query) {
        return await this.salesService.getAllSales(query);
    }
    async getMargins() {
        return await this.salesService.getMargins();
    }
    async createMargins(body) {
        return await this.salesService.createFinMargin(body);
    }
    async getSale(id) {
        return await this.salesService.getSale(id);
    }
    async getSalePaymentData(id) {
        return await this.salesService.getSalesPaymentDetails(id);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBody)({
        type: create_sales_dto_1.CreateSalesDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_dto_1.CreateSalesDto, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Record a cash payment for a sale' }),
    (0, swagger_1.ApiBody)({
        type: cash_payment_dto_1.RecordCashPaymentDto,
        description: 'Cash payment details',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('record-cash-payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_payment_dto_1.RecordCashPaymentDto, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "recordCashPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBody)({
        type: validate_sale_product_dto_1.ValidateSaleProductDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('validate-sale-product-quantity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_sale_product_dto_1.ValidateSaleProductDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "validateSaleProductQuantity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(list_sales_dto_1.ListSalesQueryDto),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_sales_dto_1.ListSalesQueryDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getSales", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('financial-margins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getMargins", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('financial-margins'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_financial_margins_dto_1.CreateFinancialMarginDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createMargins", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Sale id to fetch details.',
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getSale", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Sale id to fetch payment details.',
    }),
    (0, common_1.Get)(':id/payment-data'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getSalePaymentData", null);
exports.SalesController = SalesController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Sales'),
    (0, common_1.Controller)('sales'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    __param(1, (0, bullmq_1.InjectQueue)('payment-queue')),
    __metadata("design:paramtypes", [sales_service_1.SalesService,
        bullmq_2.Queue])
], SalesController);
//# sourceMappingURL=sales.controller.js.map