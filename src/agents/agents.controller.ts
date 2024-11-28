import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesAndPermissions } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesAndPermissionsGuard } from '../auth/guards/roles.guard';
import { ActionEnum, Agent, SubjectEnum } from '@prisma/client';
import { GetAgentsDto } from './dto/get-agent.dto';
import { GetUser } from '../auth/decorators/getUser';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Agents}`],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiBody({
    type: CreateAgentDto,
    description: 'Json structure for request payload',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(@Body() CreateAgentDto: CreateAgentDto, @GetUser('id') id: string,) {
    return await this.agentsService.create(CreateAgentDto, id);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Agents}`],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @Get()
  @ApiOkResponse({
    description: 'Fetch all agents with pagination',
    isArray: true,
  })
  @ApiOperation({
    summary: 'Fetch all agents with pagination',
    description: 'Fetch all agents with pagination',
  })
  @ApiBadRequestResponse({})
  @ApiExtraModels(GetAgentsDto)
  @HttpCode(HttpStatus.OK)
  async getAllAgents(@Query() GetAgentsDto: GetAgentsDto) {
    return this.agentsService.getAll(GetAgentsDto);
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Agents}`],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the agent to fetch',
  })
  @ApiResponse({
    status: 200,
    description: 'The details of the agent.',
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found.',
  })
  @Get(':id')
  @ApiOperation({
    summary: 'Fetch agent details',
    description:
      'This endpoint allows a permitted user fetch a agent details.',
  })
  async getAgent(@Param('id') id: string): Promise<Agent> {
    const agent = await this.agentsService.findOne(id);
   
    return agent;
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Agents}`],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiOkResponse({
    description: 'Fetch Agent statistics',
  })
  @ApiOperation({
    summary: 'Fetch Agent statistics',
    description: 'Fetch Agent statistics',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @Get('/statistics/view')
  async getAgentsStatistics() {
    return this.agentsService.getAgentsStatistics();
  }

  @UseGuards(JwtAuthGuard, RolesAndPermissionsGuard)
  @RolesAndPermissions({
    permissions: [`${ActionEnum.manage}:${SubjectEnum.Agents}`],
  })
  @ApiBearerAuth('access_token')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token used for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer <token>',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Agent id to fetch tabs',
  })
  @ApiOkResponse({
    description: 'Fetch Agent Tabs',
    isArray: true,
  })
  @ApiOperation({
    summary: 'Fetch Agent Tabs for a particular agent',
    description: 'Fetch Agent Tabs for a particular agent',
  })
  @ApiBadRequestResponse({})
  @HttpCode(HttpStatus.OK)
  @Get(':id/tabs')
  async getInventoryTabs(@Param('id') agentId: string) {
    return this.agentsService.getAgentTabs(agentId);
  }
}
