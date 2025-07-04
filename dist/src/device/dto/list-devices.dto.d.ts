export declare class ListDevicesQueryDto {
    serialNumber?: string;
    startingCode?: string;
    key?: string;
    hardwareModel?: string;
    createdAt?: string;
    updatedAt?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    fetchFormat?: 'all' | 'used' | 'unused';
    search?: string;
    page?: string;
    limit?: string;
    isTokenable?: boolean;
}
