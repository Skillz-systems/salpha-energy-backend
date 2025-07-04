import { Prisma } from '@prisma/client';
export declare class OpenPayGoService {
    generateToken(data: Prisma.DeviceCreateInput, days: number, deviceCount: number): Promise<{
        newCount: number;
        finalToken: string;
    }>;
}
