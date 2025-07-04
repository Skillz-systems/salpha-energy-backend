"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const generate_pwd_1 = require("../utils/generate-pwd");
const helpers_util_1 = require("../utils/helpers.util");
const constants_1 = require("../constants");
const mongodb_1 = require("mongodb");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../users/entity/user.entity");
let AgentsService = class AgentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAgentDto, userId) {
        const { email, addressType, location, ...otherData } = createAgentDto;
        const agentId = this.generateAgentNumber();
        const existingEmail = await this.prisma.user.findFirst({
            where: { email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const existingAgent = await this.prisma.agent.findFirst({
            where: { userId },
        });
        if (existingAgent) {
            throw new common_1.ConflictException('Agent with the provided userId already exists');
        }
        const existingAgentId = await this.prisma.agent.findFirst({
            where: { agentId },
        });
        if (existingAgentId) {
            throw new common_1.ConflictException('Agent with the agent ID already exists');
        }
        const password = (0, generate_pwd_1.generateRandomPassword)(30);
        const hashedPassword = await (0, helpers_util_1.hashPassword)(password);
        const defaultRole = await this.prisma.role.findFirst({
            where: {
                permissions: {
                    some: {
                        subject: 'Agents',
                        action: 'manage',
                    },
                },
            },
        });
        if (!defaultRole) {
            throw new common_1.NotFoundException('Default role for agents not found');
        }
        const newUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                addressType: addressType,
                location,
                roleId: defaultRole.id,
                ...otherData,
            },
        });
        const newAgent = await this.prisma.agent.create({
            data: {
                agentId,
                userId: newUser.id,
            },
        });
        return newAgent;
    }
    async getAll(getProductsDto) {
        const { page = 1, limit = 100, status, sortField, sortOrder, search, createdAt, updatedAt, } = getProductsDto;
        const whereConditions = {
            AND: [
                search
                    ? {
                        user: {
                            OR: [
                                { firstname: { contains: search, mode: 'insensitive' } },
                                { lastname: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                                { username: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    }
                    : {},
                status ? { user: { status } } : {},
                createdAt ? { createdAt: { gte: new Date(createdAt) } } : {},
                updatedAt ? { updatedAt: { gte: new Date(updatedAt) } } : {},
            ],
        };
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const orderBy = {
            [sortField || 'createdAt']: sortOrder || 'asc',
        };
        const agents = await this.prisma.agent.findMany({
            where: whereConditions,
            include: {
                user: true,
            },
            skip,
            take,
            orderBy: {
                user: orderBy,
            },
        });
        const total = await this.prisma.agent.count({
            where: whereConditions,
        });
        return {
            agents: agents.map((agent) => ({
                ...agent,
                user: (0, class_transformer_1.plainToInstance)(user_entity_1.UserEntity, agent.user),
            })),
            total,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(total / limitNumber),
        };
    }
    async findOne(id) {
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException(`Invalid permission ID: ${id}`);
        }
        const agent = await this.prisma.agent.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        if (!agent) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.AGENT_NOT_FOUND);
        }
        return agent;
    }
    async getAgentsStatistics() {
        const allAgents = await this.prisma.agent.count();
        const activeAgentsCount = await this.prisma.agent.count({
            where: {
                user: {
                    status: client_1.UserStatus.active,
                },
            },
        });
        const barredAgentsCount = await this.prisma.agent.count({
            where: {
                user: {
                    status: client_1.UserStatus.barred,
                },
            },
        });
        if (!allAgents) {
            throw new common_1.NotFoundException('No agents found.');
        }
        return {
            total: allAgents,
            active: activeAgentsCount,
            barred: barredAgentsCount,
        };
    }
    async getAgentTabs(agentId) {
        if (!this.isValidObjectId(agentId)) {
            throw new common_1.BadRequestException(`Invalid permission ID: ${agentId}`);
        }
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                user: {
                    include: {
                        _count: {
                            select: { createdCustomers: true },
                        },
                    },
                },
            },
        });
        if (!agent) {
            throw new common_1.NotFoundException(constants_1.MESSAGES.AGENT_NOT_FOUND);
        }
        const tabs = [
            {
                name: 'Agents Details',
                url: `/agent/${agentId}/details`,
            },
            {
                name: 'Customers',
                url: `/agent/${agentId}/customers`,
                count: agent.user._count.createdCustomers,
            },
            {
                name: 'Inventory',
                url: `/agent/${agentId}/inventory`,
                count: 0,
            },
            {
                name: 'Transactions',
                url: `/agent/${agentId}/transactions`,
                count: 0,
            },
            {
                name: 'Stats',
                url: `/agent/${agentId}/stats`,
            },
            {
                name: 'Sales',
                url: `/agent/${agentId}/sales`,
                count: 0,
            },
            {
                name: 'Tickets',
                url: `/agent/${agentId}/tickets`,
                count: 0,
            },
        ];
        return tabs;
    }
    generateAgentNumber() {
        return Math.floor(10000000 + Math.random() * 90000000);
    }
    isValidObjectId(id) {
        return mongodb_1.ObjectId.isValid(id);
    }
};
exports.AgentsService = AgentsService;
exports.AgentsService = AgentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgentsService);
//# sourceMappingURL=agents.service.js.map