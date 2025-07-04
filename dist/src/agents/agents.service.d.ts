import { CreateAgentDto } from './dto/create-agent.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetAgentsDto } from './dto/get-agent.dto';
import { UserEntity } from '../users/entity/user.entity';
export declare class AgentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAgentDto: CreateAgentDto, userId: any): Promise<{
        createdAt: Date;
        userId: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        agentId: number;
    }>;
    getAll(getProductsDto: GetAgentsDto): Promise<{
        agents: {
            user: UserEntity;
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
    findOne(id: string): Promise<{
        user: {
            createdAt: Date;
            firstname: string | null;
            lastname: string | null;
            email: string;
            phone: string | null;
            location: string | null;
            id: string;
            username: string | null;
            password: string;
            addressType: import("@prisma/client").$Enums.AddressType | null;
            staffId: string | null;
            longitude: string | null;
            latitude: string | null;
            emailVerified: boolean;
            isBlocked: boolean;
            status: import("@prisma/client").$Enums.UserStatus;
            roleId: string;
            updatedAt: Date;
            deletedAt: Date | null;
            lastLogin: Date | null;
        };
    } & {
        createdAt: Date;
        userId: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        agentId: number;
    }>;
    getAgentsStatistics(): Promise<{
        total: number;
        active: number;
        barred: number;
    }>;
    getAgentTabs(agentId: string): Promise<({
        name: string;
        url: string;
        count?: undefined;
    } | {
        name: string;
        url: string;
        count: number;
    })[]>;
    private generateAgentNumber;
    private isValidObjectId;
}
