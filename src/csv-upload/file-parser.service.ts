import { Injectable, Logger } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { CsvDataType } from './dto/csv-upload.dto';

interface SheetData {
  sheetName: string;
  dataType: CsvDataType;
  data: any[];
  headers: string[];
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  async parseFile(file: Express.Multer.File): Promise<SheetData[]> {
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    switch (fileExtension) {
      case '.csv':
        return await this.parseCsvFile(file.buffer);
      case '.xlsx':
      case '.xls':
        return await this.parseExcelFile(file.buffer);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  private async parseCsvFile(buffer: Buffer): Promise<SheetData[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(
          csvParser()
        )
        .on('data', (data) => {
          // Clean up the data - remove empty fields and trim strings
          const cleanedData: any = {};
          for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined && value !== '') {
              cleanedData[key.trim()] =
                typeof value === 'string' ? value.trim() : value;
            }
          }
          if (Object.keys(cleanedData).length > 0) {
            results.push(cleanedData);
          }
        })
        .on('end', () => {
          if (results.length === 0) {
            resolve([]);
            return;
          }

          const headers = Object.keys(results[0]);
          const dataType = this.detectDataTypeFromHeaders(headers);

          resolve([
            {
              sheetName: 'Sheet1',
              dataType,
              data: results,
              headers,
            },
          ]);
        })
        .on('error', (error) => {
          this.logger.error('Error parsing CSV file', error);
          reject(error);
        });
    });
  }

  private async parseExcelFile(buffer: Buffer): Promise<SheetData[]> {
    try {
      const workbook = XLSX.read(buffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: false, // Don't include empty cells
      });

      const sheets: SheetData[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Use array of arrays first to get headers
          defval: '', // Default value for empty cells
          blankrows: false, // Skip blank rows
        });

        if (jsonData.length === 0) {
          this.logger.warn(`Sheet ${sheetName} is empty, skipping`);
          continue;
        }

        // Extract headers from first row
        const headers = (jsonData[0] as any[])
          .map((header, index) => header || `Column_${index + 1}`)
          .map((header) => header.toString().trim())
          .filter((header) => header !== '');

        if (headers.length === 0) {
          this.logger.warn(`Sheet ${sheetName} has no valid headers, skipping`);
          continue;
        }

        // Convert to objects using headers
        const objectData = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          blankrows: false,
        });

        // Clean and filter data
        const cleanedData = objectData
          .map((row: any) => {
            const cleanedRow: any = {};
            let hasData = false;

            for (const [key, value] of Object.entries(row)) {
              if (value !== null && value !== undefined && value !== '') {
                const cleanKey = key.toString().trim();
                const cleanValue =
                  typeof value === 'string' ? value.trim() : value;

                if (cleanKey && cleanValue !== '') {
                  cleanedRow[cleanKey] = cleanValue;
                  hasData = true;
                }
              }
            }

            return hasData ? cleanedRow : null;
          })
          .filter((row) => row !== null);

        if (cleanedData.length === 0) {
          this.logger.warn(
            `Sheet ${sheetName} has no valid data after cleaning, skipping`,
          );
          continue;
        }

        const dataType = this.detectDataTypeFromHeaders(
          Object.keys(cleanedData[0]),
        );

        sheets.push({
          sheetName,
          dataType,
          data: cleanedData,
          headers: Object.keys(cleanedData[0]),
        });

        this.logger.log(
          `Parsed sheet: ${sheetName} with ${cleanedData.length} rows`,
        );
      }

      return sheets;
    } catch (error) {
      this.logger.error('Error parsing Excel file', error);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  private detectDataTypeFromHeaders(headers: string[]): CsvDataType {
    const salesPatterns = [
      /customer.*name/i,
      /external.*id/i,
      /serial/i,
      /model/i,
      /location/i,
      /phone/i,
      /payment.*plan/i,
      /retail.*cost/i,
      /end.*user/i,
      /downpayment/i,
      /installment/i,
      /pv.*capacity/i,
      /type.*payment/i,
      /customer/i,
      /client/i,
      /product/i,
      /contract/i,
      /loan/i,
      /address/i,
      /mobile/i,
    ];
  
    const transactionPatterns = [
      /transaction/i,
      /payment/i,
      /amount/i,
      /reference/i,
      /receipt/i,
      /date/i,
      /time/i,
      /trans/i,
    ];

    const salesScore = this.calculatePatternScore(headers, salesPatterns);
    const transactionScore = this.calculatePatternScore(
      headers,
      transactionPatterns,
    );

    this.logger.debug(
      `Header analysis - Sales score: ${salesScore}, Transaction score: ${transactionScore}`,
    );

    if (salesScore > transactionScore && salesScore > 0.3) {
      return CsvDataType.SALES;
    } else if (transactionScore > salesScore && transactionScore > 0.3) {
      return CsvDataType.TRANSACTIONS;
    } else if (salesScore > 0.2 && transactionScore > 0.2) {
      return CsvDataType.MIXED;
    }

    return CsvDataType.AUTO_DETECT;
  }

  private calculatePatternScore(headers: string[], patterns: RegExp[]): number {
    let matches = 0;
    const lowerHeaders = headers.map((h) => h.toLowerCase());

    for (const header of lowerHeaders) {
      for (const pattern of patterns) {
        if (pattern.test(header)) {
          matches++;
          break; // Count each header only once
        }
      }
    }

    return headers.length > 0 ? matches / headers.length : 0;
  }
}
