import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType, IDType, CustomerType } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Length,
  IsEmail,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer Firstname',
    example: 'James',
  })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({
    description: 'Customer Lastname',
    example: 'Lewis',
  })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiPropertyOptional({
    description: 'The email of the customer',
    example: 'francisalexander000@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The phone number of the customer',
    maxLength: 15,
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 15)
  phone: string;

  @ApiProperty({
    description: 'The alternate phone number of the customer',
    maxLength: 15,
    example: '+1234567891',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 15)
  alternatePhone?: string;

  @ApiProperty({
    description: 'Gender of the customer',
    example: 'Male',
  })
  @IsNotEmpty()
  @IsString()
  gender?: string;

  @ApiProperty({
    enum: AddressType,
    example: 'HOME',
  })
  @IsNotEmpty()
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({
    description: 'Installation address of the customer',
    example: '123 Main Street, Apartment 4B',
  })
  @IsNotEmpty()
  @IsString()
  installationAddress: string;

  @ApiProperty({
    description: 'Local Government Area',
    example: 'Ikeja',
  })
  @IsNotEmpty()
  @IsString()
  lga: string;

  @ApiProperty({
    description: 'State',
    example: 'Lagos',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'The location of the customer',
    example: 'New York, USA',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiPropertyOptional({
    description: 'The longitude of the customer',
    type: String,
    example: '',
  })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiPropertyOptional({
    description: 'The latitude of the customer',
    type: String,
    example: '',
  })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional({
    enum: IDType,
    description: 'Type of ID document',
    example: 'NATIONAL_ID',
  })
  @IsOptional()
  @IsEnum(IDType)
  idType?: IDType;

  @ApiPropertyOptional({
    description: 'ID number',
    example: '12345678901',
  })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional({
    enum: CustomerType,
    description: 'Customer type',
    example: 'lead',
    default: 'lead',
  })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({
    type: 'file',
    description: 'Customer passport photo file',
    format: 'binary',
  })
  passportPhoto?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'file',
    description: 'Customer ID image file',
    format: 'binary',
  })
  idImage?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'file',
    description: 'Customer contract form image file',
    format: 'binary',
  })
  contractFormImage?: Express.Multer.File;
}
