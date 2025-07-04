import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { Warehouse } from '@prisma/client';
import { GetWarehousesDto } from './dto/get-warehouse-dto';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(CreateWarehouseDto: CreateWarehouseDto, file: Express.Multer.File): Promise<{
        createdAt: Date;
        name: string;
        type: string | null;
        id: string;
        status: string | null;
        updatedAt: Date;
        image: string | null;
        inventoryClasses: string | null;
    }>;
    getAllWarehouses(GetWarehousesDto: GetWarehousesDto): Promise<{
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
    getWarehouse(id: string): Promise<Warehouse>;
    deactivateWarehouse(id: string): Promise<Warehouse>;
    getProductStatistics(): Promise<{
        allWarehouses: number;
    }>;
}
