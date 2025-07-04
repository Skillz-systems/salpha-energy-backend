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
exports.DeviceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs_1 = require("fs");
const csvParser = require("csv-parser");
const constants_1 = require("../constants");
const openpaygo_service_1 = require("../openpaygo/openpaygo.service");
let DeviceService = class DeviceService {
    constructor(prisma, openPayGo) {
        this.prisma = prisma;
        this.openPayGo = openPayGo;
    }
    async uploadBatchDevices(filePath) {
        const rows = await this.parseCsv(filePath);
        const filteredRows = rows.filter((row) => row['Serial_Number'] && row['Key']);
        await this.mapDevicesToModel(filteredRows);
        return { message: constants_1.MESSAGES.CREATED };
    }
    async createDevice(createDeviceDto) {
        const device = await this.fetchDevice({
            serialNumber: createDeviceDto.serialNumber,
        });
        if (device)
            throw new common_1.BadRequestException(constants_1.MESSAGES.DEVICE_EXISTS);
        return await this.prisma.device.create({
            data: createDeviceDto,
        });
    }
    async createBatchDeviceTokens(filePath) {
        const rows = await this.parseCsv(filePath);
        console.log({ filePath, rows });
        const filteredRows = rows.filter((row) => row['Serial_Number'] && row['Key']);
        console.log({ rows });
        const data = filteredRows.map((row) => ({
            serialNumber: row['Serial_Number'],
            deviceName: row['Device_Name'],
            key: row['Key'],
            count: row['Count'],
            timeDivider: row['Time_Divider'],
            firmwareVersion: row['Firmware_Version'],
            hardwareModel: row['Hardware_Model'],
            startingCode: row['Starting_Code'],
            restrictedDigitMode: row['Restricted_Digit_Mode'] == '1',
            isTokenable: row['Tokenable'] == '1',
        }));
        const deviceTokens = [];
        const processedDevices = [];
        for (const deviceData of data) {
            try {
                const device = await this.prisma.device.upsert({
                    where: { serialNumber: deviceData.serialNumber },
                    update: {
                        key: deviceData.key,
                        timeDivider: deviceData.timeDivider,
                        firmwareVersion: deviceData.firmwareVersion,
                        hardwareModel: deviceData.hardwareModel,
                        startingCode: deviceData.startingCode,
                        restrictedDigitMode: deviceData.restrictedDigitMode,
                        updatedAt: new Date(),
                    },
                    create: {
                        serialNumber: deviceData.serialNumber,
                        key: deviceData.key,
                        count: deviceData.count,
                        timeDivider: deviceData.timeDivider,
                        firmwareVersion: deviceData.firmwareVersion,
                        hardwareModel: deviceData.hardwareModel,
                        startingCode: deviceData.startingCode,
                        restrictedDigitMode: deviceData.restrictedDigitMode,
                        isTokenable: true,
                    },
                });
                const token = await this.openPayGo.generateToken(deviceData, -1, Number(device.count));
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { count: String(token.newCount) },
                });
                await this.prisma.tokens.create({
                    data: {
                        deviceId: device.id,
                        token: String(token.finalToken),
                        duration: -1,
                    },
                });
                deviceTokens.push({
                    deviceId: device.id,
                    deviceSerialNumber: device.serialNumber,
                    deviceKey: device.key,
                    deviceToken: token.finalToken,
                    duration: -1,
                });
                processedDevices.push(device);
            }
            catch (error) {
                console.error(`Error processing device ${deviceData.serialNumber}:`, error);
            }
        }
        return {
            message: constants_1.MESSAGES.CREATED,
            devicesProcessed: processedDevices.length,
            deviceTokens,
        };
    }
    async generateSingleDeviceToken(deviceId, tokenDuration) {
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new common_1.NotFoundException(`Device with ID ${deviceId} not found`);
        }
        try {
            const token = await this.openPayGo.generateToken({
                key: device.key,
                timeDivider: device.timeDivider,
                restrictedDigitMode: device.restrictedDigitMode,
                startingCode: device.startingCode,
            }, tokenDuration, Number(device.count));
            await this.prisma.device.update({
                where: { id: deviceId },
                data: { count: String(token.newCount) },
            });
            const savedToken = await this.prisma.tokens.create({
                data: {
                    deviceId: device.id,
                    token: String(token.finalToken),
                    duration: tokenDuration,
                },
            });
            return {
                message: 'Token generated successfully',
                deviceId: device.id,
                deviceSerialNumber: device.serialNumber,
                tokenId: savedToken.id,
                deviceToken: token.finalToken,
                tokenDuration: tokenDuration === -1 ? 'Forever' : `${tokenDuration} days`,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to generate token: ${error.message}`);
        }
    }
    async devicesFilter(query) {
        const { search, serialNumber, startingCode, key, hardwareModel, isTokenable, createdAt, updatedAt, fetchFormat, } = query;
        const filterConditions = {
            AND: [
                search
                    ? {
                        OR: [
                            { serialNumber: { contains: search, mode: 'insensitive' } },
                            { startingCode: { contains: search, mode: 'insensitive' } },
                            { key: { contains: search, mode: 'insensitive' } },
                            { hardwareModel: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
                serialNumber
                    ? { serialNumber: { contains: serialNumber, mode: 'insensitive' } }
                    : {},
                startingCode
                    ? { startingCode: { contains: startingCode, mode: 'insensitive' } }
                    : {},
                key ? { key: { contains: key, mode: 'insensitive' } } : {},
                hardwareModel
                    ? { hardwareModel: { contains: hardwareModel, mode: 'insensitive' } }
                    : {},
                isTokenable
                    ? {
                        isTokenable,
                    }
                    : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
            ],
        };
        return filterConditions;
    }
    async fetchDevices(query) {
        const { page = 1, limit = 100, sortField, sortOrder } = query;
        const filterConditions = await this.devicesFilter(query);
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const totalCount = await this.prisma.device.count({
            where: filterConditions,
        });
        const result = await this.prisma.device.findMany({
            skip,
            take,
            where: {},
            include: {
                _count: {
                    select: {
                        tokens: true,
                    },
                },
            },
            orderBy,
        });
        return {
            devices: result,
            total: totalCount,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async fetchDevice(fieldAndValue) {
        return await this.prisma.device.findUnique({
            where: { ...fieldAndValue },
            include: {
                tokens: true,
            },
        });
    }
    async updateDevice(id, updateDeviceDto) {
        await this.validateDeviceExistsAndReturn({ id });
        return await this.prisma.device.update({
            where: { id },
            data: updateDeviceDto,
        });
    }
    async deleteDevice(id) {
        await this.validateDeviceExistsAndReturn({ id });
        await this.prisma.device.delete({
            where: { id },
        });
        return { message: constants_1.MESSAGES.DELETED };
    }
    async validateDeviceExistsAndReturn(fieldAndValue) {
        const device = await this.fetchDevice(fieldAndValue);
        if (!device)
            throw new common_1.BadRequestException(constants_1.MESSAGES.DEVICE_NOT_FOUND);
        return device;
    }
    async parseCsv(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            (0, fs_1.createReadStream)(filePath)
                .pipe(csvParser())
                .on('data', (data) => {
                const normalizedData = Object.keys(data).reduce((acc, key) => {
                    const normalizedKey = key.trim().replace(/\s+/g, '_');
                    acc[normalizedKey] = data[key];
                    return acc;
                }, {});
                results.push(normalizedData);
            })
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        });
    }
    async mapDevicesToModel(rows) {
        const data = rows.map((row) => ({
            serialNumber: row['Serial_Number'],
            deviceName: row['Device_Name'],
            key: row['Key'],
            count: row['Count'],
            timeDivider: row['Time_Divider'],
            firmwareVersion: row['Firmware_Version'],
            hardwareModel: row['Hardware_Model'],
            startingCode: row['Starting_Code'],
            restrictedDigitMode: row['Restricted_Digit_Mode'] == '1',
            isTokenable: row['Tokenable'] == '1',
        }));
        for (const device of data) {
            await this.prisma.device.upsert({
                where: { serialNumber: device.serialNumber },
                update: {},
                create: { ...device },
            });
        }
    }
};
exports.DeviceService = DeviceService;
exports.DeviceService = DeviceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        openpaygo_service_1.OpenPayGoService])
], DeviceService);
//# sourceMappingURL=device.service.js.map