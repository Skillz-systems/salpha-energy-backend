import { CsvUploadService } from './csv-upload.service';
import { CsvUploadResponseDto, CsvUploadStatsDto, ProcessCsvDto, ValidationResultDto, BatchProcessRequestDto, SessionStatsRequestDto } from './dto/csv-upload.dto';
export declare class CsvUploadController {
    private readonly csvUploadService;
    constructor(csvUploadService: CsvUploadService);
    validateFile(file: Express.Multer.File): Promise<ValidationResultDto>;
    processFile(file: Express.Multer.File, processCsvDto: ProcessCsvDto): Promise<CsvUploadResponseDto>;
    processBatch(batchRequest: BatchProcessRequestDto): Promise<CsvUploadStatsDto>;
    getUploadStats(statsRequest: SessionStatsRequestDto): Promise<CsvUploadStatsDto>;
    cancelSession(cancelRequest: SessionStatsRequestDto): Promise<{
        success: boolean;
        message: string;
        sessionId: string;
    }>;
}
