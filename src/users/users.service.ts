import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from 'src/constants';
import { RolesEnum } from '@prisma/client';
import { hashPassword } from 'src/utils/helpers.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerUserDto: RegisterUserDto) {
    const { username, email, password } = registerUserDto;

    const emailExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (emailExists) {
      throw new BadRequestException(MESSAGES.EMAIL_IN_USE);
    }

    const usernameExists = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (usernameExists) {
      throw new BadRequestException(MESSAGES.USERNAME_IN_USE);
    }

    const hashedPwd = await hashPassword(password);

    return await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPwd,
        role: {
          connectOrCreate: {
            where: {
              role: RolesEnum.customer,
            },
            create: {
              role: RolesEnum.customer,
            },
          },
        },
      },
      include: {
        role: true
      }
    });
  }

  findAll() {
    return [];
  }
}
