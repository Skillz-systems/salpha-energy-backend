import { BadRequestException, Injectable } from '@nestjs/common';
import { MESSAGES } from '../constants';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../utils/helpers.util';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../mailer/email.service';
import { generateRandomPassword } from '../utils/generate-pwd';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly Email: EmailService,
    private readonly config: ConfigService,
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
}
