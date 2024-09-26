import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as argon from 'argon2';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../utils/helpers.util';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../mailer/email.service';
import { generateRandomPassword } from '../utils/generate-pwd';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { MESSAGES } from '../constants';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly Email: EmailService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async addUser(userData: CreateUserDto) {
    const {
      email,
      firstname,
      lastname,
      location,
      phone,
      role: roleId,
    } = userData;

    const emailExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (emailExists) {
      throw new BadRequestException(MESSAGES.EMAIL_EXISTS);
    }
    
    const roleExists = await this.prisma.role.findFirst({
      where: {
        id: roleId,
      },
    });

    if (!roleExists) {
      throw new BadRequestException(MESSAGES.customInvalidMsg('role'));
    }

    const newPwd = generateRandomPassword();

    const hashedPwd = await hashPassword(newPwd);

    const newUser = await this.prisma.user.create({
      data: {
        firstname,
        lastname,
        location,
        phone,
        email,
        password: hashedPwd,
        roleId,
      },
      include: {
        role: true,
      },
    });

    const platformName = 'A4T Energy';
    const loginUrl = 'https://google.com';

    await this.Email.sendMail({
      userId: newUser.id,
      to: email,
      from: this.config.get<string>('EMAIL_USER'),
      subject: `Welcome to ${platformName} - Let's Get You Started!`,
      template: './new-user-onboarding',
      context: {
        firstname,
        userEmail: email,
        loginUrl,
        platformName,
        supportEmail: this.config.get<string>('EMAIL_USER'),
        tempPassword: newPwd,
      },
    });

    return newUser;
  }

  async login(data: LoginUserDTO, res: Response) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);

    const verifyPassword = await argon.verify(user.password, password);

    if (!verifyPassword)
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);

    const payload = { sub: user.id };

    const access_token = this.jwtService.sign(payload);

    res.setHeader('access_token', access_token);
    res.setHeader('Access-Control-Expose-Headers', 'access_token');

    return user;
  }

  async forgotPassword(forgotPasswordDetails: ForgotPasswordDTO) {
    const { email } = forgotPasswordDetails;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser) {
      throw new BadRequestException(MESSAGES.USER_NOT_FOUND);
    }

    const existingToken = await this.prisma.tempToken.findFirst({
      where: {
        token_type: TokenType.password_reset,
        token: {
          not: null,
        },
        userId: existingUser.id,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    const resetToken = uuidv4();
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
    } else {
      await this.prisma.tempToken.create({
        data: {
          token: resetToken,
          expiresAt: newExpirationTime,
          token_type: TokenType.password_reset,
          userId: existingUser.id,
        },
      });
    }

    const platformName = 'A4T Energy';
    const clentUrl = this.config.get<string>('CLIENT_URL');
    const resetLink = `${clentUrl}/resetPassword`;

    await this.Email.sendMail({
      to: email,
      from: this.config.get<string>('EMAIL_USER'),
      subject: `Reset Your Password - ${platformName}`,
      template: './reset-password',
      context: {
        firstname: existingUser.firstname,
        resetLink,
        platformName,
        supportEmail: this.config.get<string>('EMAIL_USER'),
      },
    });

    return {
      message: MESSAGES.PWD_RESET_MAIL_SENT,
    };
  }

  async resetPassword(resetPasswordDetails: PasswordResetDTO) {
    const { newPassword, resetToken } = resetPasswordDetails;

    const tokenValid = await this.prisma.tempToken.findFirst({
      where: {
        token_type: TokenType.password_reset,
        token: resetToken,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!tokenValid) {
      throw new BadRequestException(MESSAGES.INVALID_TOKEN);
    }

    const hashedPwd = await hashPassword(newPassword);

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
      message: MESSAGES.PWD_RESET_SUCCESS,
    };
  }

  async verifyResetToken(resetToken: string) {
    const tokenValid = await this.prisma.tempToken.findFirst({
      where: {
        token_type: TokenType.password_reset,
        token: resetToken,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!tokenValid) {
      throw new BadRequestException(MESSAGES.INVALID_TOKEN);
    }

    return { message: MESSAGES.TOKEN_VALID };
  }
}
