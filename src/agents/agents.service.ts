import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateRandomPassword } from 'src/utils/generate-pwd';
import * as argon from 'argon2';
import { hashPassword } from 'src/utils/helpers.util';

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

  findAll() {
    return `This action returns all agents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agent`;
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
}
