export class WarehouseInventory {}
import { Exclude } from 'class-transformer';
import { Inventory, InventoryClass, InventoryStatus, Warehouse } from '@prisma/client';

export class WarehouseInventoryEntity implements Partial<Inventory> {
  id: string;
  name: string;
  manufacturerName: string;
  sku: string;
  image: string;
  dateOfManufacture: string;
  batchNumber: number;
  status: InventoryStatus;
  class: InventoryClass;
  inventoryCategory: string;
  inventorySubCategory: string;
  batches: Array<any>;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  deletedAt: Date;

  constructor(partial: Partial<WarehouseInventoryEntity>) {
    Object.assign(this, partial);
  }
}
