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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const platform_express_1 = require("@nestjs/platform-express");
const get_products_dto_1 = require("./dto/get-products.dto");
const create_category_dto_1 = require("./dto/create-category.dto");
const getUser_1 = require("../auth/decorators/getUser");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async create(CreateProductDto, file, id) {
        return await this.productsService.create(CreateProductDto, file, id);
    }
    async getAllProducts(getProductsDto) {
        return this.productsService.getAllProducts(getProductsDto);
    }
    async getProduct(id) {
        const product = await this.productsService.getProduct(id);
        return product;
    }
    async createCategory(createCategoryDto) {
        return this.productsService.createProductCategory(createCategoryDto);
    }
    async getAllCategories() {
        return this.productsService.getAllCategories();
    }
    async getInventoryTabs(productId) {
        return this.productsService.getProductTabs(productId);
    }
    async getProductInventory(productId) {
        return this.productsService.getProductInventory(productId);
    }
    async getProductStatistics() {
        return this.productsService.getProductStatistics();
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
        type: create_product_dto_1.CreateProductDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create product',
        description: 'Create product',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('productImage')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY }))),
    __param(2, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch all products with pagination',
        isArray: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch all products with pagination',
        description: 'Fetch all products with pagination',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(get_products_dto_1.GetProductsDto),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_products_dto_1.GetProductsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
        description: 'ID of the product to fetch',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The details of the product.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found.',
    }),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch product details',
        description: 'This endpoint allows a permitted user fetch a product details.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
    (0, common_1.Post)('create-category'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create product category',
        description: 'This endpoint allows a permitted user to create a product category.',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Product category created successfully' }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid product category creation data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateProductCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
    (0, common_1.Get)('/categories/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch all product categories',
        description: 'This endpoint allows a permitted user fetch  all product categories.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
        description: 'Product id to fetch tabs',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Product Tabs',
        isArray: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Product Tabs for a particular product',
        description: 'Fetch Product Tabs for a particular product',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':id/tabs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getInventoryTabs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
        description: 'Product id to fetch product inventory',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Product Inventory',
        isArray: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch product inventory for a particular product',
        description: 'Fetch product inventory for a particular product',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':id/inventory'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductInventory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Products}`],
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
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Product statistics',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Product statistics',
        description: 'Fetch Product statistics',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('/statistics/view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductStatistics", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map