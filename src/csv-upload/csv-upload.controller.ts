import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
  Res,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Express, Response } from 'express';
import { CsvUploadService } from './csv-upload.service';
import {
  CsvFileUploadDto,
  CsvUploadResponseDto,
  CsvUploadStatsDto,
  ProcessCsvDto,
  ValidationResultDto,
  BatchProcessRequestDto,
  SessionStatsRequestDto,
} from './dto/csv-upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { ActionEnum, SubjectEnum } from '@prisma/client';
import { CsvExportService } from './csv-export.service';

@ApiTags('CSV Data Migration')
@Controller('csv-upload')
export class CsvUploadController {
  constructor(
    private readonly csvUploadService: CsvUploadService,
    private readonly csvExportService: CsvExportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @Post('validate')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Validate CSV/Excel file structure',
    description:
      'Upload and validate file structure without processing data. Supports CSV and Excel files with multiple sheets.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to validate',
    type: CsvFileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Validation result with auto-detected structure and generated defaults',
    type: ValidationResultDto,
  })
  @HttpCode(HttpStatus.OK)
  async validateFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ValidationResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      throw new BadRequestException(
        'Only CSV and Excel files are allowed (.csv, .xlsx, .xls)',
      );
    }

    // Validate file size (max 100MB for Excel, 50MB for CSV)
    const maxSize =
      fileExtension === '.csv' ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      );
    }

    return await this.csvUploadService.validateFile(file);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Process and import data from CSV/Excel file',
    description:
      'Upload and process file with automatic data transformation, default value generation, and intelligent batch import. All missing required fields are automatically handled.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to process with optional processing parameters',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file to process',
        },
        batchSize: {
          type: 'integer',
          minimum: 10,
          maximum: 1000,
          default: 100,
          description: 'Number of records to process per batch',
        },
        skipValidation: {
          type: 'boolean',
          default: false,
          description: 'Skip validation if already validated',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File processing started with session tracking',
    type: CsvUploadResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async processFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() processCsvDto: ProcessCsvDto,
  ): Promise<CsvUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      throw new BadRequestException(
        'Only CSV and Excel files are allowed (.csv, .xlsx, .xls)',
      );
    }

    // Validate file size
    const maxSize =
      fileExtension === '.csv' ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      );
    }

    return await this.csvUploadService.processFile(file, processCsvDto);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @Get('export-sales')
  @ApiOperation({
    summary: 'Export sales data as CSV',
    description:
      'Export sales data with optional date range filtering in the same format as the upload template',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by sales status',
    enum: ['COMPLETED', 'IN_INSTALLMENT', 'CANCELLED', 'UNPAID'],
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file download',
    headers: {
      'Content-Type': {
        description: 'text/csv',
      },
      'Content-Disposition': {
        description: 'attachment; filename="sales_export_YYYY-MM-DD.csv"',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async exportSales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    try {
      // Validate date parameters
      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;

      if (startDate) {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          throw new BadRequestException('Invalid start date format');
        }
      }

      if (endDate) {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new BadRequestException('Invalid end date format');
        }
      }

      if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Generate CSV content
      const csvContent = await this.csvExportService.exportSalesToCsv({
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status: status as any,
      });

      // Generate filename with date range
      const dateRange =
        parsedStartDate && parsedEndDate
          ? `${parsedStartDate.toISOString().split('T')[0]}_to_${parsedEndDate.toISOString().split('T')[0]}`
          : new Date().toISOString().split('T')[0];

      const filename = `sales_export_${dateRange}.csv`;

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', Buffer.byteLength(csvContent));

      // Send CSV content
      res.send(csvContent);
    } catch (error) {
      throw new BadRequestException(
        `Failed to export sales data: ${error.message}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @Post('process-batch')
  @ApiOperation({
    summary: 'Process specific batch of validated data',
    description:
      'Process a specific batch of pre-validated data from an ongoing session',
  })
  @ApiBody({
    description: 'Batch processing request',
    type: BatchProcessRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Batch processing result',
    type: CsvUploadStatsDto,
  })
  @HttpCode(HttpStatus.OK)
  async processBatch(
    @Body() batchRequest: BatchProcessRequestDto,
  ): Promise<CsvUploadStatsDto> {
    return await this.csvUploadService.processBatch(
      batchRequest.sessionId,
      batchRequest.batchIndex,
    );
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Sales}`],
  })
  @Post('get-upload-stats')
  @ApiOperation({
    summary: 'Get upload session statistics',
    description:
      'Retrieve detailed statistics for an ongoing upload session including progress, errors, and created records',
  })
  @ApiBody({
    description: 'Session stats request',
    type: SessionStatsRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed upload statistics',
    type: CsvUploadStatsDto,
  })
  @HttpCode(HttpStatus.OK)
  async getUploadStats(
    @Body() statsRequest: SessionStatsRequestDto,
  ): Promise<CsvUploadStatsDto> {
    return await this.csvUploadService.getUploadStats(statsRequest.sessionId);
  }

  @Post('cancel-session')
  @ApiOperation({
    summary: 'Cancel an ongoing upload session',
    description:
      'Cancel processing for a specific session and cleanup resources',
  })
  @ApiBody({
    description: 'Session to cancel',
    type: SessionStatsRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Session cancellation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        sessionId: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async cancelSession(
    @Body() cancelRequest: SessionStatsRequestDto,
  ): Promise<{ success: boolean; message: string; sessionId: string }> {
    return await this.csvUploadService.cancelSession(cancelRequest.sessionId);
  }
}
