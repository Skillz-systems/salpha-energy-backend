import { DataMappingService } from './data-mapping.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CsvUploadController } from './csv-upload.controller';
import { CsvUploadService } from './csv-upload.service';
import { DefaultsGeneratorService } from './defaults-generator.service';
import { FileParserService } from './file-parser.service';
import { CsvExportService } from './csv-export.service';

@Module({
  imports: [PrismaModule],
  controllers: [CsvUploadController],
  providers: [
    CsvUploadService,
    DataMappingService,
    DefaultsGeneratorService,
    FileParserService,
    CsvExportService,
  ],
  exports: [
    CsvUploadService,
    DataMappingService,
    DefaultsGeneratorService,
    FileParserService,
    CsvExportService,
  ],
})
export class CsvUploadModule {}
