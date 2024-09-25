import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignUserToRoleDto } from './dto/assign-user.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { role, active, permissionIds } = createRoleDto;

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
          connect: permissionIds?.map((id) => ({ id })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          select: {
            id: true,
            action: true,
            subject: true,
          },
        },
      },
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
    const { role, active, permissionIds } = updateRoleDto;

    // Prepare the data object for Prisma
    const data: any = {};
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = active;

    if (permissionIds !== undefined) {
      data.permissions = {
        set: [],
        connect: permissionIds.map((id) => ({ id })),
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

  async assignUserToRole(id: string, assignUserToRoleDto: AssignUserToRoleDto) {
    const { roleId } = assignUserToRoleDto;

    // Check if the role exists if provided
    if (roleId) {
      const roleExists = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!roleExists) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
    }

    // Update the user
    this.prisma.user.update({
      where: { id },
      data: {
        role: { connect: { id: roleId } },
      },
    });

    return {
      message: 'This user has been assigned to a role successfully',
    };
  }

  async getRoleWithUsersAndPermissions(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true, 
        permissions: true,
      },
    });
  }
}
