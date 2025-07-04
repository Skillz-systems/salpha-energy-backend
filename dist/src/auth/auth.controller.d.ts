import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { CreateSuperUserDto } from './dto/create-super-user.dto';
import { CreateUserPasswordDto, CreateUserPasswordParamsDto } from './dto/create-user-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    addUser(registerUserDto: CreateUserDto): Promise<UserEntity>;
    createSuperuser(registerUserDto: CreateSuperUserDto): Promise<UserEntity>;
    login(userDetails: LoginUserDTO, res: Response): Promise<UserEntity>;
    forgotPassword(forgotPasswordDetails: ForgotPasswordDTO): Promise<{
        message: string;
    }>;
    verifyResetToken(params: CreateUserPasswordParamsDto): Promise<{
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
    verifyEmailVerficationToken(params: CreateUserPasswordParamsDto): Promise<{
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
    createUserPassword(body: CreateUserPasswordDto, params: CreateUserPasswordParamsDto): Promise<{
        message: string;
    }>;
    changePassword(body: ChangePasswordDto, userId: string): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDetails: PasswordResetDTO): Promise<{
        message: string;
    }>;
}
