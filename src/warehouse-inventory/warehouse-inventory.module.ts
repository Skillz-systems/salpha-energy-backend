import { Module } from '@nestjs/common';
import { WarehouseInventoryService } from './warehouse-inventory.service';
import { WarehouseInventoryController } from './warehouse-inventory.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [WarehouseInventoryController],
  providers: [WarehouseInventoryService],
})
export class WarehouseInventoryModule {}
