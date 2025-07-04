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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const throttler_1 = require("@nestjs/throttler");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const getUser_1 = require("../auth/decorators/getUser");
const user_entity_1 = require("../users/entity/user.entity");
const list_customers_dto_1 = require("./dto/list-customers.dto");
let CustomersController = class CustomersController {
    constructor(customersService) {
        this.customersService = customersService;
    }
    async create(createCustomersDto, requestUserId) {
        return await this.customersService.createCustomer(requestUserId, createCustomersDto);
    }
    async listCustomers(query) {
        return await this.customersService.getCustomers(query);
    }
    async fetchUser(id) {
        return new user_entity_1.UserEntity(await this.customersService.getCustomer(id));
    }
    async deleteUser(id) {
        return await this.customersService.deleteCustomer(id);
    }
    async getCustomerStats() {
        return await this.customersService.getCustomerStats();
    }
    async getCustomerTabs(customerId) {
        return this.customersService.getCustomerTabs(customerId);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`,
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`,
        ],
    }),
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
    (0, swagger_1.ApiBody)({
        type: create_customer_dto_1.CreateCustomerDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        description: 'List all customers with pagination',
        type: user_entity_1.UserEntity,
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(list_customers_dto_1.ListCustomersQueryDto),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_customers_dto_1.ListCustomersQueryDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "listCustomers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`,
        ],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: "Customer's id to fetch details",
    }),
    (0, common_1.Get)('single/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch customer details by superuser',
        description: 'This endpoint allows a permitted customer fetch a user details.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        type: user_entity_1.UserEntity,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "fetchUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: "Customer's id",
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete customer by superuser',
        description: 'This endpoint allows a permitted customer to delete a user.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({
        type: user_entity_1.UserEntity,
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`,
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`,
        ],
    }),
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
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Customer Statistics',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`,
            `${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Customers}`,
        ],
    }),
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
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer id to fetch tabs',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Customer Details Tabs',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':id/tabs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerTabs", null);
exports.CustomersController = CustomersController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Customers'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map