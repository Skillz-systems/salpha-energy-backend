import { ConfigModule, ConfigService } from '@nestjs/config';
export declare const CloudinaryProvider: {
    provide: string;
    imports: (typeof ConfigModule)[];
    useFactory: (configService: ConfigService) => Promise<import("cloudinary").ConfigOptions>;
    inject: (typeof ConfigService)[];
};
