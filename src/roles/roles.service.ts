import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly config: ConfigService,
  ) {}

  async create(createRoleDto) {
    // const data = await this.prisma.role.create({
    //   data: {
    //     role: 'superduper',
    //     // active: true

    //   },
    // });
    return 'This action adds a new role';
  }
}
