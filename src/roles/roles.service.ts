import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { role, active, permissions } = createRoleDto;
    
    // Check if the role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { role },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name ${role} already exists`);
    }

    return this.prisma.role.create({
      data: {
        role,
        active,
        permissions: {
          connect: permissions?.map(id => ({ id })),
        },
      },
    });
  }


  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ 
      where: { id },
      include: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { role, active, permissions } = updateRoleDto;

    // Prepare the data object for Prisma
    const data: any = {};
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = active;

    if (permissions !== undefined) {
      data.permissions = {
        set: [],
        connect: permissions.map(id => ({ id })),
      };
    }

      if (role !== undefined) {
        const existingRole = await this.prisma.role.findFirst({
          where: {
            role,
            NOT: { id },
          },
        });
  
        if (existingRole) {
          throw new ConflictException(`Role with name ${role} already exists`);
        }
      }
  

    try {
      return await this.prisma.role.update({
        where: { id },
        data,
        include: { permissions: true },
      });
    } catch (error) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
  }

  async remove(id: string) {
    const role = await this.prisma.role.delete({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }
}
