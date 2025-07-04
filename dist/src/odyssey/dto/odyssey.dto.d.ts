export declare class OdysseyPaymentDto {
    timestamp: string;
    amount: number;
    currency: string;
    transactionType: string;
    transactionId: string;
    serialNumber: string;
    meterId: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    customerCategory?: string;
    financingId?: string;
    agentId?: string;
    latitude?: string;
    longitude?: string;
    utilityId?: string;
    failedBatteryCapacityCount?: number;
}
export declare class OdysseyPaymentResponseDto {
    payments: OdysseyPaymentDto[];
    errors: string;
}
export declare class OdysseyPaymentQueryDto {
    from: Date;
    to: Date;
    financingId?: string;
    siteId?: string;
    country?: string;
}
export declare class GenerateTokenDto {
    clientName: string;
    expirationDays?: number;
}
export declare class TokenResponseDto {
    token: string;
    clientName: string;
    expiresAt: Date;
    createdAt: Date;
}
