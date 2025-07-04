import { PrismaService } from '../prisma/prisma.service';
import { OdysseyPaymentQueryDto, OdysseyPaymentResponseDto } from './dto/odyssey.dto';
export declare class OdysseyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getPayments(query: OdysseyPaymentQueryDto): Promise<OdysseyPaymentResponseDto>;
    validateApiToken(token: string): Promise<boolean>;
    private transformToOdysseyFormat;
    private determineTransactionType;
    private mapCustomerCategory;
    private generateUtilityId;
    private shouldIncludePayment;
    private isInCountry;
    private isInSite;
    generateApiToken(clientName: string, expirationDays?: number): Promise<string>;
    private generateSecureToken;
    revokeApiToken(token: string): Promise<boolean>;
    listActiveTokens(): Promise<any[]>;
}
