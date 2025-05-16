import {
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the warehouse' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    default: 'normal',
    description: 'Type of the warehouse',
  })
  type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Inventory classes for the warehouse. The distinct inventory classess should be concatenated together and separated by comma',
  })
  inventoryClasses: string;

  @ApiProperty({ type: 'file', description: 'Warehouse image file' })
  image: Express.Multer.File;
}