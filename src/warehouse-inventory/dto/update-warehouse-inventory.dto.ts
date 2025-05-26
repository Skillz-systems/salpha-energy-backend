import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseInventoryDto } from './create-warehouse-inventory.dto';

export class UpdateWarehouseInventoryDto extends PartialType(CreateWarehouseInventoryDto) {}
