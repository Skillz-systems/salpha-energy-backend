import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../src/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
    }): Promise<{
        role: {
            role: string;
            id: string;
            active: boolean | null;
            permissionIds: string[];
            created_by: string | null;
            created_at: Date;
            updated_at: Date | null;
            deleted_at: Date | null;
        };
    } & {
        createdAt: Date;
        firstname: string | null;
        lastname: string | null;
        email: string;
        phone: string | null;
        location: string | null;
        id: string;
        username: string | null;
        password: string;
        addressType: import("@prisma/client").$Enums.AddressType | null;
        staffId: string | null;
        longitude: string | null;
        latitude: string | null;
        emailVerified: boolean;
        isBlocked: boolean;
        status: import("@prisma/client").$Enums.UserStatus;
        roleId: string;
        updatedAt: Date;
        deletedAt: Date | null;
        lastLogin: Date | null;
    }>;
}
export {};
