import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { Agent } from '@prisma/client';
import { GetAgentsDto } from './dto/get-agent.dto';
export declare class AgentsController {
    private readonly agentsService;
    constructor(agentsService: AgentsService);
    create(CreateAgentDto: CreateAgentDto, id: string): Promise<{
        createdAt: Date;
        userId: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        agentId: number;
    }>;
    getAllAgents(GetAgentsDto: GetAgentsDto): Promise<{
        agents: {
            user: import("../users/entity/user.entity").UserEntity;
            createdAt: Date;
            userId: string;
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
            agentId: number;
        }[];
        total: number;
        page: string | number;
        limit: string | number;
        totalPages: number;
    }>;
    getAgent(id: string): Promise<Agent>;
    getAgentsStatistics(): Promise<{
        total: number;
        active: number;
        barred: number;
    }>;
    getInventoryTabs(agentId: string): Promise<({
        name: string;
        url: string;
        count?: undefined;
    } | {
        name: string;
        url: string;
        count: number;
    })[]>;
}
