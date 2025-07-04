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
exports.ContractController = void 0;
const common_1 = require("@nestjs/common");
const contract_service_1 = require("./contract.service");
const throttler_1 = require("@nestjs/throttler");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../utils/dto/pagination.dto");
const platform_express_1 = require("@nestjs/platform-express");
let ContractController = class ContractController {
    constructor(contractService) {
        this.contractService = contractService;
    }
    async getContracts(query) {
        return await this.contractService.getAllContracts(query);
    }
    async getContract(id) {
        return await this.contractService.getContract(id);
    }
    async uploadSignage(id, file) {
        return await this.contractService.uploadSignage(id, file);
    }
};
exports.ContractController = ContractController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Contracts}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(pagination_dto_1.PaginationQueryDto),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "getContracts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Contracts}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Contract id to fetch details.',
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "getContract", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Contracts}`],
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('signature')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Contract id to upload signage for.',
    }),
    (0, common_1.Post)(':id/upload-signage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|svg)$/i })
        .build({ errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "uploadSignage", null);
exports.ContractController = ContractController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Contract'),
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
    (0, common_1.Controller)('contract'),
    __metadata("design:paramtypes", [contract_service_1.ContractService])
], ContractController);
//# sourceMappingURL=contract.controller.js.map