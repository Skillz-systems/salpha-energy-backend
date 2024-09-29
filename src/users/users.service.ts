import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '../constants';
import { validateOrReject } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page: number = 1, limit: number = 100) {
    const skip = (page - 1) * limit;
    const take = limit;

    const result = await this.prisma.user.findMany({
      skip,
      take,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const users = plainToInstance(UserEntity, result);

    const totalCount = await this.prisma.user.count();

    return {
      users,
      total: totalCount,
      page,
      limit,
      totalPages: limit === 0 ? 0 : Math.ceil(totalCount / limit),
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    const validDto = plainToInstance(UpdateUserDto, updateUserDto);

    await validateOrReject(validDto);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...validDto,
      },
    });

    return updatedUser;
  }
}
