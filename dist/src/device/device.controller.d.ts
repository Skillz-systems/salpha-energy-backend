import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ListDevicesQueryDto } from './dto/list-devices.dto';
export declare class DeviceController {
    private readonly deviceService;
    constructor(deviceService: DeviceService);
    createBatchDevices(file: Express.Multer.File): Promise<{
        message: string;
    }>;
    createBatchDeviceTokens(file: Express.Multer.File): Promise<{
        message: string;
        devicesProcessed: number;
        deviceTokens: any[];
    }>;
    generateSingleDeviceToken(deviceId: string, body: {
        tokenDuration: number;
    }): Promise<{
        message: string;
        deviceId: string;
        deviceSerialNumber: string;
        tokenId: string;
        deviceToken: string;
        tokenDuration: string;
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
    fetchDevice(id: string): Promise<{
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
}
