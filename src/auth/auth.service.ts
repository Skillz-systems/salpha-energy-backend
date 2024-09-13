import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from 'src/constants';
import { RolesEnum } from '@prisma/client';
import { hashPassword } from 'src/utils/helpers.util';

@Injectable()
export class AuthService {
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
        role: true,
      },
    });
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
