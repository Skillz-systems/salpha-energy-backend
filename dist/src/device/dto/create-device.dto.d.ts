export declare class CreateDeviceDto {
    serialNumber: string;
    key: string;
    startingCode?: string;
    count?: string;
    timeDivider?: string;
    restrictedDigitMode?: boolean;
    hardwareModel?: string;
    firmwareVersion?: string;
    isTokenable?: boolean;
}
export declare class CreateBatchDeviceTokensDto {
    file: Express.Multer.File;
}
