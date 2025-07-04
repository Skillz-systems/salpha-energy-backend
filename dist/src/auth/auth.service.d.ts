import { ConfigService } from '@nestjs/config';
import { TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../mailer/email.service';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { CreateSuperUserDto } from './dto/create-super-user.dto';
import { CreateUserPasswordDto, CreateUserPasswordParamsDto } from './dto/create-user-password.dto';
import { UserEntity } from '../users/entity/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly Email;
    private readonly config;
    private jwtService;
    constructor(prisma: PrismaService, Email: EmailService, config: ConfigService, jwtService: JwtService);
    addUser(userData: CreateUserDto): Promise<{
        role: {
            permissions: {
                subject: import("@prisma/client").$Enums.SubjectEnum;
                id: string;
                roleIds: string[];
                created_at: Date;
                updated_at: Date | null;
                deleted_at: Date | null;
                action: import("@prisma/client").$Enums.ActionEnum;
            }[];
        } & {
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
    createSuperuser(userData: CreateSuperUserDto): Promise<{
        role: {
            permissions: {
                subject: import("@prisma/client").$Enums.SubjectEnum;
                id: string;
                roleIds: string[];
                created_at: Date;
                updated_at: Date | null;
                deleted_at: Date | null;
                action: import("@prisma/client").$Enums.ActionEnum;
            }[];
        } & {
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
    login(data: LoginUserDTO, res: Response): Promise<UserEntity>;
    forgotPassword(forgotPasswordDetails: ForgotPasswordDTO): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDetails: PasswordResetDTO): Promise<{
        message: string;
    }>;
    createUserPassword(pwds: CreateUserPasswordDto, params: CreateUserPasswordParamsDto): Promise<{
        message: string;
    }>;
    changePassword(pwds: ChangePasswordDto, userId: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string, token_type?: TokenType, userId?: string): Promise<{
        user: {
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
        };
    } & {
        userId: string;
        id: string;
        token: string | null;
        created_at: Date;
        updated_at: Date | null;
        deleted_at: Date | null;
        expiresAt: Date;
        token_type: import("@prisma/client").$Enums.TokenType;
    }>;
}
