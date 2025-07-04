import { OdysseyPaymentResponseDto } from './dto/odyssey.dto';
import { OdysseyService } from './odyssey.service';
export declare class OdysseyController {
    private readonly odysseyPaymentService;
    private readonly logger;
    constructor(odysseyPaymentService: OdysseyService);
    getPayments(authorization: string, fromDate: string, toDate: string, financingId?: string, siteId?: string, country?: string): Promise<OdysseyPaymentResponseDto>;
    private validateToken;
    private parseAndValidateDate;
}
