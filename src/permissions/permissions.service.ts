import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

   // Create a new permission
   async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: {
        action: createPermissionDto.action,
        subject: createPermissionDto.subject,
      },
    });
  }

  // Get all permissions
  // async findAll() {
  //   return this.prisma.permission.findMany({
  //     include: {
  //       role: true, // Include related roles for each permission
  //     },
  //   });
  // }

  // Get one permission by ID
  async findOne(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  // Update permission by ID
  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const existingPermission = await this.prisma.permission.findUnique({
      where: { id: String(id) },
    });

    if (!existingPermission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    const updateData: Prisma.PermissionUpdateInput = {};

    if (updatePermissionDto.action) {
      updateData.action = updatePermissionDto.action;
    }
    if (updatePermissionDto.subject) {
      updateData.subject = updatePermissionDto.subject;
    }

    return {
      message: `Permission with ID ${id} updated successfully`,
      data: updateData,
    };
  }

  // Delete permission by ID
  // async remove(id: string) {
    
  //   const deleted = this.prisma.permission.delete({ where: { id } });

  //   return {
  //     message: "Permission deleted successfully"
  //   }
  // }
}
