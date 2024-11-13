import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateRandomPassword } from 'src/utils/generate-pwd';
import * as argon from 'argon2';
import { hashPassword } from 'src/utils/helpers.util';
import { GetAgentsDto } from './dto/get-agent.dto';
import { MESSAGES } from 'src/constants';
import { ObjectId } from 'mongodb';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAgentDto: CreateAgentDto) {

    const { email, ...otherData } = createAgentDto;

    const agentId  = this.generateAgentNumber();

    // Check if email or agentId already exists
    const existingAgent = await this.prisma.agent.findFirst({
      where: {
        email
      },
    });

    if (existingAgent) {
      throw new ConflictException('Agent with the provided email already exists');
    }

    const existingAgentId = await this.prisma.agent.findFirst({
      where: {
        agentId 
      },
    });

    if (existingAgentId) {
      throw new ConflictException('Agent with the agent ID already exists');
    }

    const password = generateRandomPassword(30);

    const hashedPassword = await hashPassword(password);

    const newAgent = await this.prisma.agent.create({
      data: {
        email,
        agentId,
        password: hashedPassword,
        ...otherData,
      },
    });

    const { password: _, ...result } = newAgent;
    return result;
  }

  async getAll(getProductsDto: GetAgentsDto) {
    const {
      page = 1,
      limit = 10,
      status,
      createdAt,
      updatedAt,
    } = getProductsDto;

    const whereConditions: any = {};

    // Apply filtering conditions
    if (status) whereConditions.status = status;
    if (createdAt) whereConditions.createdAt = { gte: new Date(createdAt) };
    if (updatedAt) whereConditions.updatedAt = { gte: new Date(updatedAt) };

    const skip = (page - 1) * limit;

    // Fetch products with pagination and filters
    const agents = await this.prisma.agent.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.agent.count({
      where: whereConditions,
    });

    return {
      data: agents,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findOne(id: string) {

    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid permission ID: ${id}`);
    }


    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException(MESSAGES.AGENT_NOT_FOUND);
    }

    return agent;
  }

  update(id: number, updateAgentDto: UpdateAgentDto) {
    return `This action updates a #${id} agent`;
  }

  remove(id: number) {
    return `This action removes a #${id} agent`;
  }

  private generateAgentNumber(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }

    // Helper function to validate MongoDB ObjectId
    private isValidObjectId(id: string): boolean {
      return ObjectId.isValid(id);
    }
}
