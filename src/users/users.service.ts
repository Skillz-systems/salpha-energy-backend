import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page: number = 1, limit: number = 100) {
    const skip = (page - 1) * limit;
    const take = limit;

    const users = await this.prisma.user.findMany({
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

    const totalCount = await this.prisma.user.count();

    return {
      users,
      total: totalCount,
      page,
      limit,
      totalPages: limit === 0 ? 0 : Math.ceil(totalCount / limit),
    };
  }
}
