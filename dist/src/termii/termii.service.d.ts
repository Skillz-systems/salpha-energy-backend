import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface DeviceTokenSmsData {
    deviceSerialNumber: string;
    deviceKey: string;
    deviceToken: string;
    deviceName?: string;
}
export interface SendSmsOptions {
    to: string;
    message: string;
    type?: 'plain' | 'unicode';
    channel?: 'dnd' | 'whatsapp' | 'generic';
    from?: string;
}
export declare class TermiiService {
    private readonly config;
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly senderId;
    constructor(config: ConfigService, httpService: HttpService);
    sendSms(options: SendSmsOptions): Promise<any>;
    sendDeviceTokensSms(phoneNumber: string, deviceTokens: DeviceTokenSmsData[], customerName?: string): Promise<any>;
    private formatDeviceTokensMessage;
    private formatPhoneNumber;
    getAccountBalance(): Promise<any>;
    testSmsConnection(): Promise<boolean>;
}
