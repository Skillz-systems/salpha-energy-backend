"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const argon = require("argon2");
const prisma_service_1 = require("../prisma/prisma.service");
const helpers_util_1 = require("../utils/helpers.util");
const email_service_1 = require("../mailer/email.service");
const constants_1 = require("../constants");
const generate_pwd_1 = require("../utils/generate-pwd");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../users/entity/user.entity");
let AuthService = class AuthService {
    constructor(prisma, Email, config, jwtService) {
        this.prisma = prisma;
        this.Email = Email;
        this.config = config;
        this.jwtService = jwtService;
    }
    async addUser(userData) {
        const { email, firstname, lastname, location, phone, role: roleId, } = userData;
        const emailExists = await this.prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (emailExists) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.EMAIL_EXISTS);
        }
        const roleExists = await this.prisma.role.findFirst({
            where: {
                id: roleId,
            },
        });
        if (!roleExists) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.customInvalidMsg('role'));
        }
        const newPwd = (0, generate_pwd_1.generateRandomPassword)(30);
        const hashedPwd = await (0, helpers_util_1.hashPassword)(newPwd);
        const newUser = await this.prisma.user.create({
            data: {
                firstname,
                lastname,
                location,
                phone,
                email,
                password: hashedPwd,
                roleId,
                status: client_1.UserStatus.inactive,
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        const resetToken = (0, uuid_1.v4)();
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getFullYear() + 1);
        const token = await this.prisma.tempToken.create({
            data: {
                token: resetToken,
                expiresAt: expirationTime,
                token_type: client_1.TokenType.email_verification,
                userId: newUser.id,
            },
        });
        const platformName = 'A4T Energy';
        const clientUrl = this.config.get('CLIENT_URL');
        const createPasswordUrl = `${clientUrl}create-password/${newUser.id}/${token.token}/`;
        await this.Email.sendMail({
            userId: newUser.id,
            to: email,
            from: this.config.get('MAIL_FROM'),
            subject: `Welcome to ${platformName} - Let's Get You Started!`,
            template: './new-user-onboarding',
            context: {
                firstname,
                userEmail: email,
                platformName,
                createPasswordUrl,
                supportEmail: this.config.get('MAIL_FROM') || 'a4t@gmail.com',
            },
        });
        return newUser;
    }
    async createSuperuser(userData) {
        const { email, firstname, lastname, password, cKey } = userData;
        const adminCreationToken = '09yu2408h0wnh89h20';
        if (adminCreationToken !== cKey) {
            throw new common_1.ForbiddenException();
        }
        const emailExists = await this.prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (emailExists) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.EMAIL_EXISTS);
        }
        const hashedPwd = await (0, helpers_util_1.hashPassword)(password);
        const newUser = await this.prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPwd,
                role: {
                    connectOrCreate: {
                        where: {
                            role: 'admin',
                        },
                        create: {
                            role: 'admin',
                        },
                    },
                },
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        return newUser;
    }
    async login(data, res) {
        const { email, password } = data;
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        if (!user)
            throw new common_1.BadRequestException(constants_1.MESSAGES.INVALID_CREDENTIALS);
        const verifyPassword = await argon.verify(user.password, password);
        if (!verifyPassword)
            throw new common_1.BadRequestException(constants_1.MESSAGES.INVALID_CREDENTIALS);
        const payload = { sub: user.id };
        const access_token = this.jwtService.sign(payload);
        res.setHeader('access_token', access_token);
        res.setHeader('Access-Control-Expose-Headers', 'access_token');
        return (0, class_transformer_1.plainToInstance)(user_entity_1.UserEntity, user);
    }
    async forgotPassword(forgotPasswordDetails) {
        const { email } = forgotPasswordDetails;
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!existingUser) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        let existingToken = await this.prisma.tempToken.findFirst({
            where: {
                token_type: client_1.TokenType.password_reset,
                token: {
                    not: null,
                },
                userId: existingUser.id,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });
        const resetToken = (0, uuid_1.v4)();
        const newExpirationTime = new Date();
        newExpirationTime.setHours(newExpirationTime.getHours() + 1);
        if (existingToken) {
            await this.prisma.tempToken.update({
                where: { id: existingToken.id },
                data: {
                    token: resetToken,
                    expiresAt: newExpirationTime,
                },
            });
        }
        else {
            existingToken = await this.prisma.tempToken.create({
                data: {
                    token: resetToken,
                    expiresAt: newExpirationTime,
                    token_type: client_1.TokenType.password_reset,
                    userId: existingUser.id,
                },
            });
        }
        const platformName = 'A4T Energy';
        const clientUrl = this.config.get('CLIENT_URL');
        const resetLink = `${clientUrl}resetPassword/${existingUser.id}/${existingToken.token}/`;
        await this.Email.sendMail({
            to: email,
            from: this.config.get('MAIL_FROM'),
            subject: `Reset Your Password - ${platformName}`,
            template: './reset-password',
            context: {
                firstname: existingUser.firstname,
                resetLink,
                platformName,
                supportEmail: this.config.get('MAIL_FROM'),
            },
        });
        return {
            message: constants_1.MESSAGES.PWD_RESET_MAIL_SENT,
        };
    }
    async resetPassword(resetPasswordDetails) {
        const { newPassword, resetToken, userid } = resetPasswordDetails;
        const tokenValid = await this.verifyToken(resetToken, client_1.TokenType.password_reset, userid);
        const hashedPwd = await (0, helpers_util_1.hashPassword)(newPassword);
        await this.prisma.user.update({
            where: {
                id: tokenValid.userId,
            },
            data: {
                password: hashedPwd,
            },
        });
        await this.prisma.tempToken.update({
            where: {
                id: tokenValid.id,
            },
            data: {
                token: null,
                expiresAt: new Date('2000-01-01T00:00:00Z'),
            },
        });
        return {
            message: constants_1.MESSAGES.PWD_RESET_SUCCESS,
        };
    }
    async createUserPassword(pwds, params) {
        const tokenValid = await this.verifyToken(params.token, client_1.TokenType.email_verification, params.userid);
        const hashedPwd = await (0, helpers_util_1.hashPassword)(pwds.password);
        await this.prisma.user.update({
            where: {
                id: tokenValid.userId,
            },
            data: {
                password: hashedPwd,
                status: client_1.UserStatus.active,
            },
        });
        await this.prisma.tempToken.update({
            where: {
                id: tokenValid.id,
            },
            data: {
                token: null,
                expiresAt: new Date('2000-01-01T00:00:00Z'),
            },
        });
        return {
            message: constants_1.MESSAGES.PWD_CREATION_SUCCESS,
        };
    }
    async changePassword(pwds, userId) {
        const authUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                role: true,
            },
        });
        const { password, oldPassword } = pwds;
        const verifyPassword = await argon.verify(authUser.password, oldPassword);
        if (!verifyPassword)
            throw new common_1.BadRequestException(constants_1.MESSAGES.INVALID_CREDENTIALS);
        const isNewPwdSameAsOld = await argon.verify(authUser.password, password);
        if (isNewPwdSameAsOld)
            throw new common_1.BadRequestException(constants_1.MESSAGES.PWD_SIMILAR_TO_OLD);
        const hashedPwd = await (0, helpers_util_1.hashPassword)(password);
        await this.prisma.user.update({
            where: {
                id: authUser.id,
            },
            data: {
                password: hashedPwd,
            },
        });
        return {
            message: constants_1.MESSAGES.PASSWORD_CHANGED_SUCCESS,
        };
    }
    async verifyToken(token, token_type = client_1.TokenType.email_verification, userId) {
        const tokenValid = await this.prisma.tempToken.findFirst({
            where: {
                token_type,
                token,
                ...(userId && { userId }),
                expiresAt: {
                    gte: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
        if (!tokenValid) {
            throw new common_1.BadRequestException(constants_1.MESSAGES.INVALID_TOKEN);
        }
        return tokenValid;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map