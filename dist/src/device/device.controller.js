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
exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
const device_service_1 = require("./device.service");
const create_device_dto_1 = require("./dto/create-device.dto");
const update_device_dto_1 = require("./dto/update-device.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const fs_1 = require("fs");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const list_devices_dto_1 = require("./dto/list-devices.dto");
const throttler_1 = require("@nestjs/throttler");
let DeviceController = class DeviceController {
    constructor(deviceService) {
        this.deviceService = deviceService;
    }
    async createBatchDevices(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = ['.csv'];
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
            throw new common_1.BadRequestException('Only CSV files are allowed (.csv)');
        }
        const filePath = file.path;
        const upload = await this.deviceService.uploadBatchDevices(filePath);
        (0, fs_1.unlinkSync)(filePath);
        return upload;
    }
    async createBatchDeviceTokens(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = ['.csv'];
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
            throw new common_1.BadRequestException('Only CSV files are allowed (.csv)');
        }
        const filePath = file.path;
        try {
            const upload = await this.deviceService.createBatchDeviceTokens(filePath);
            return upload;
        }
        finally {
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch (error) {
                console.warn('Failed to delete uploaded file:', error);
            }
        }
    }
    async generateSingleDeviceToken(deviceId, body) {
        const { tokenDuration } = body;
        if (tokenDuration === undefined || tokenDuration === null) {
            throw new common_1.BadRequestException('Token duration is required');
        }
        return await this.deviceService.generateSingleDeviceToken(deviceId, tokenDuration);
    }
    async createDevice(createDeviceDto) {
        return await this.deviceService.createDevice(createDeviceDto);
    }
    async fetchDevices(query) {
        return await this.deviceService.fetchDevices(query);
    }
    async fetchDevice(id) {
        return await this.deviceService.validateDeviceExistsAndReturn({ id });
    }
    async updateDevice(id, updateDeviceDto) {
        return await this.deviceService.updateDevice(id, updateDeviceDto);
    }
    async deleteDevice(id) {
        return await this.deviceService.deleteDevice(id);
    }
};
exports.DeviceController = DeviceController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './files',
        }),
    })),
    (0, common_1.Post)('batch-upload'),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "createBatchDevices", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBody)({
        type: create_device_dto_1.CreateBatchDeviceTokensDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './files',
        }),
    })),
    (0, common_1.Post)('batch/generate-tokens'),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "createBatchDeviceTokens", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'deviceId',
        type: String,
        description: 'Device ID',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                tokenDuration: {
                    type: 'number',
                    description: 'Token duration in days (-1 for forever token)',
                    example: 30,
                },
            },
            required: ['tokenDuration'],
        },
    }),
    (0, common_1.Post)(':deviceId/generate-token'),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "generateSingleDeviceToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiBody)({
        type: create_device_dto_1.CreateDeviceDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a single device' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_dto_1.CreateDeviceDto]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "createDevice", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch all devices' }),
    (0, swagger_1.ApiExtraModels)(list_devices_dto_1.ListDevicesQueryDto),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_devices_dto_1.ListDevicesQueryDto]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "fetchDevices", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Device id to fetch details',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch a single device by ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "fetchDevice", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Device id to update details',
    }),
    (0, swagger_1.ApiBody)({
        type: update_device_dto_1.UpdateDeviceDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a device by ID' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_device_dto_1.UpdateDeviceDto]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Sales}`],
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Device id to delete details',
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a device by ID' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "deleteDevice", null);
exports.DeviceController = DeviceController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiTags)('Devices'),
    (0, common_1.Controller)('device'),
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
    __metadata("design:paramtypes", [device_service_1.DeviceService])
], DeviceController);
//# sourceMappingURL=device.controller.js.map