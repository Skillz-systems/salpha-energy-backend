import { CreateDeviceDto } from './dto/create-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Prisma } from '@prisma/client';
import { ListDevicesQueryDto } from './dto/list-devices.dto';
import { OpenPayGoService } from '../openpaygo/openpaygo.service';
export declare class DeviceService {
    private readonly prisma;
    private readonly openPayGo;
    constructor(prisma: PrismaService, openPayGo: OpenPayGoService);
    uploadBatchDevices(filePath: string): Promise<{
        message: string;
    }>;
    createDevice(createDeviceDto: CreateDeviceDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        count: string | null;
        serialNumber: string;
        key: string;
        startingCode: string | null;
        timeDivider: string | null;
        restrictedDigitMode: boolean;
        hardwareModel: string | null;
        firmwareVersion: string | null;
        isTokenable: boolean;
        isUsed: boolean;
        saleItemIDs: string[];
    }>;
    createBatchDeviceTokens(filePath: string): Promise<{
        message: string;
        devicesProcessed: number;
        deviceTokens: any[];
    }>;
    generateSingleDeviceToken(deviceId: string, tokenDuration: number): Promise<{
        message: string;
        deviceId: string;
        deviceSerialNumber: string;
        tokenId: string;
        deviceToken: string;
        tokenDuration: string;
    }>;
    devicesFilter(query: ListDevicesQueryDto): Promise<Prisma.DeviceWhereInput>;
    fetchDevices(query: ListDevicesQueryDto): Promise<{
        devices: ({
            _count: {
                tokens: number;
            };
        } & {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            count: string | null;
            serialNumber: string;
            key: string;
            startingCode: string | null;
            timeDivider: string | null;
            restrictedDigitMode: boolean;
            hardwareModel: string | null;
            firmwareVersion: string | null;
            isTokenable: boolean;
            isUsed: boolean;
            saleItemIDs: string[];
        })[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    fetchDevice(fieldAndValue: Prisma.DeviceWhereUniqueInput): Promise<{
        tokens: {
            createdAt: Date;
            id: string;
            token: string;
            duration: number;
            deviceId: string | null;
        }[];
    } & {
        createdAt: Date;
        id: string;
        updatedAt: Date;
        count: string | null;
        serialNumber: string;
        key: string;
        startingCode: string | null;
        timeDivider: string | null;
        restrictedDigitMode: boolean;
        hardwareModel: string | null;
        firmwareVersion: string | null;
        isTokenable: boolean;
        isUsed: boolean;
        saleItemIDs: string[];
    }>;
    updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        count: string | null;
        serialNumber: string;
        key: string;
        startingCode: string | null;
        timeDivider: string | null;
        restrictedDigitMode: boolean;
        hardwareModel: string | null;
        firmwareVersion: string | null;
        isTokenable: boolean;
        isUsed: boolean;
        saleItemIDs: string[];
    }>;
    deleteDevice(id: string): Promise<{
        message: string;
    }>;
    validateDeviceExistsAndReturn(fieldAndValue: Prisma.DeviceWhereUniqueInput): Promise<{
        tokens: {
            createdAt: Date;
            id: string;
            token: string;
            duration: number;
            deviceId: string | null;
        }[];
    } & {
        createdAt: Date;
        id: string;
        updatedAt: Date;
        count: string | null;
        serialNumber: string;
        key: string;
        startingCode: string | null;
        timeDivider: string | null;
        restrictedDigitMode: boolean;
        hardwareModel: string | null;
        firmwareVersion: string | null;
        isTokenable: boolean;
        isUsed: boolean;
        saleItemIDs: string[];
    }>;
    private parseCsv;
    private mapDevicesToModel;
}
