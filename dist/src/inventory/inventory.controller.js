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
exports.InventoryController = void 0;
const throttler_1 = require("@nestjs/throttler");
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const create_inventory_dto_1 = require("./dto/create-inventory.dto");
const platform_express_1 = require("@nestjs/platform-express");
const fetch_inventory_dto_1 = require("./dto/fetch-inventory.dto");
const create_category_dto_1 = require("./dto/create-category.dto");
const create_inventory_batch_dto_1 = require("./dto/create-inventory-batch.dto");
const getUser_1 = require("../auth/decorators/getUser");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async create(createInventoryDto, requestUserId, file) {
        return await this.inventoryService.createInventory(requestUserId, createInventoryDto, file);
    }
    async createInventoryBatch(requestUserId, createInventoryDto) {
        return await this.inventoryService.createInventoryBatch(requestUserId, createInventoryDto);
    }
    async getInventories(query) {
        return await this.inventoryService.getInventories(query);
    }
    async getInventoryStats() {
        return await this.inventoryService.getInventoryStats();
    }
    async getInventoryDetails(inventoryId) {
        return await this.inventoryService.getInventory(inventoryId);
    }
    async getInventoryBatchDetails(inventoryId) {
        return await this.inventoryService.getInventoryBatch(inventoryId);
    }
    async createInventoryCategory(createCategoryArrayDto) {
        return await this.inventoryService.createInventoryCategory(createCategoryArrayDto.categories);
    }
    async getInventoryCategories() {
        return await this.inventoryService.getInventoryCategories();
    }
    async getInventoryTabs(inventoryId) {
        return this.inventoryService.getInventoryTabs(inventoryId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiBody)({
        type: create_inventory_dto_1.CreateInventoryDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('inventoryImage')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inventory_dto_1.CreateInventoryDto, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiBody)({
        type: create_inventory_batch_dto_1.CreateInventoryBatchDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('batch/create'),
    __param(0, (0, getUser_1.GetSessionUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_inventory_batch_dto_1.CreateInventoryBatchDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createInventoryBatch", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, common_1.Get)(''),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch all inventory with pagination',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(fetch_inventory_dto_1.FetchInventoryQueryDto),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fetch_inventory_dto_1.FetchInventoryQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Inventory Statistics',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Inventory id to fetch details',
    }),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Inventory details',
        description: 'This endpoint allows a permitted user fetch an inventory batch details.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryDetails", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Inventory Batch Id to fetch details',
    }),
    (0, common_1.Get)('/batch/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Inventory details',
        description: 'This endpoint allows a permitted user fetch an inventory batch details.',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiOkResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryBatchDetails", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiBody)({
        type: create_category_dto_1.CreateCategoryArrayDto,
        description: 'Category creation payload',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('category/create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create Inventory Category',
        description: 'This endpoint allows a permitted user Create an Inventory Category',
    }),
    (0, swagger_1.ApiOkResponse)({}),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryArrayDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createInventoryCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, common_1.Get)('categories/all'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch all inventory categories',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Inventory}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'inventory id to fetch tabs',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Inventory Tabs',
        isArray: true,
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':id/tabs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryTabs", null);
exports.InventoryController = InventoryController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Inventory'),
    (0, common_1.Controller)('inventory'),
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
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map