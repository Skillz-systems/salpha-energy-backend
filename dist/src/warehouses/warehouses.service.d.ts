import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { GetWarehousesDto } from './dto/get-warehouse-dto';
export declare class WarehousesService {
    private readonly cloudinary;
    private readonly prisma;
    constructor(cloudinary: CloudinaryService, prisma: PrismaService);
    uploadInventoryImage(file: Express.Multer.File): Promise<import("../cloudinary/cloudinary-response").CloudinaryResponse>;
    create(createWarehouseDto: CreateWarehouseDto, file: Express.Multer.File): Promise<{
        createdAt: Date;
        name: string;
        type: string | null;
        id: string;
        status: string | null;
        updatedAt: Date;
        image: string | null;
        inventoryClasses: string | null;
    }>;
    getAllWarehouses(getWarehousesDto: GetWarehousesDto): Promise<{
        result: {
            total: number;
            createdAt: Date;
            name: string;
            type: string | null;
            id: string;
            status: string | null;
            updatedAt: Date;
            image: string | null;
            inventoryClasses: string | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    getWarehouse(id: string): Promise<{
        total: number;
        createdAt: Date;
        name: string;
        type: string | null;
        id: string;
        status: string | null;
        updatedAt: Date;
        image: string | null;
        inventoryClasses: string | null;
    }>;
    deactivateWarehouse(id: string): Promise<{
        createdAt: Date;
        name: string;
        type: string | null;
        id: string;
        status: string | null;
        updatedAt: Date;
        image: string | null;
        inventoryClasses: string | null;
    }>;
    getWarehouseStatistics(): Promise<{
        allWarehouses: number;
    }>;
    update(id: number, updateWarehouseDto: UpdateWarehouseDto): string;
    remove(id: number): string;
}
