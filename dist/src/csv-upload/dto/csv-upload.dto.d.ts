export declare enum CsvDataType {
    SALES = "sales",
    TRANSACTIONS = "transactions",
    MIXED = "mixed",
    AUTO_DETECT = "auto_detect"
}
export declare class CsvFileUploadDto {
    file: Express.Multer.File;
}
export declare class ProcessCsvDto {
    batchSize?: number;
    skipValidation?: boolean;
}
export declare class ValidationResultDto {
    isValid: boolean;
    detectedTypes: CsvDataType[];
    fileInfo: {
        name: string;
        size: number;
        type: string;
        sheets?: string[];
    };
    sheetAnalysis: Array<{
        sheetName: string;
        dataType: CsvDataType;
        totalRows: number;
        headers: string[];
        missingFields: string[];
        sampleData: Record<string, any>[];
    }>;
    errors: string[];
    warnings: string[];
}
export declare class CsvUploadStatsDto {
    sessionId: string;
    totalRecords: number;
    processedRecords: number;
    errorRecords: number;
    skippedRecords: number;
    progressPercentage: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    breakdown: {
        sheets: Array<{
            sheetName: string;
            dataType: CsvDataType;
            total: number;
            processed: number;
            errors: number;
            created: {
                customers: number;
                products: number;
                sales: number;
                transactions: number;
                contracts: number;
            };
        }>;
    };
    errors: Array<{
        sheet: string;
        row: number;
        field: string;
        message: string;
        data: Record<string, any>;
    }>;
    startTime: Date;
    endTime?: Date;
    estimatedTimeRemaining?: number;
}
export declare class CsvUploadResponseDto {
    sessionId: string;
    success: boolean;
    message: string;
    stats: CsvUploadStatsDto;
    validation?: ValidationResultDto;
}
export declare class SalesCsvRowDto {
    CUSTOMER_NAME?: string;
    contractNumber?: string;
    ADDRESS_LINE?: string;
    MOBILE_NUMBER?: string;
    LOAN_AMOUNT?: string;
    'contract DATE'?: string;
    PRODUCT?: string;
    'PRODUCT SERIAL NUMBER'?: string;
    numberOfUnits?: string;
    'client.profile.gps.latitude'?: string;
    'client.profile.gps.longitude'?: string;
    'client.profile.gender'?: string;
    [key: string]: any;
}
export declare class TransactionsCsvRowDto {
    transactionId?: string;
    amount?: string;
    reference?: string;
    date?: string;
    [key: string]: any;
}
export declare class BatchProcessRequestDto {
    sessionId: string;
    batchIndex: number;
}
export declare class SessionStatsRequestDto {
    sessionId: string;
}
