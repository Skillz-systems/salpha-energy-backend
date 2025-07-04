import { CsvDataType } from './dto/csv-upload.dto';
interface SheetData {
    sheetName: string;
    dataType: CsvDataType;
    data: any[];
    headers: string[];
}
export declare class FileParserService {
    private readonly logger;
    parseFile(file: Express.Multer.File): Promise<SheetData[]>;
    private parseCsvFile;
    private parseExcelFile;
    private detectDataTypeFromHeaders;
    private calculatePatternScore;
    normalizeHeader(header: string): string;
    findBestHeaderMatch(targetField: string, availableHeaders: string[]): string | null;
}
export {};
