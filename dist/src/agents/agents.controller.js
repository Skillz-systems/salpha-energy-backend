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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsController = void 0;
const common_1 = require("@nestjs/common");
const agents_service_1 = require("./agents.service");
const create_agent_dto_1 = require("./dto/create-agent.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const client_1 = require("@prisma/client");
const get_agent_dto_1 = require("./dto/get-agent.dto");
const getUser_1 = require("../auth/decorators/getUser");
let AgentsController = class AgentsController {
    constructor(agentsService) {
        this.agentsService = agentsService;
    }
    async create(CreateAgentDto, id) {
        return await this.agentsService.create(CreateAgentDto, id);
    }
    async getAllAgents(GetAgentsDto) {
        return this.agentsService.getAll(GetAgentsDto);
    }
    async getAgent(id) {
        const agent = await this.agentsService.findOne(id);
        return agent;
    }
    async getAgentsStatistics() {
        return this.agentsService.getAgentsStatistics();
    }
    async getInventoryTabs(agentId) {
        return this.agentsService.getAgentTabs(agentId);
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, swagger_1.ApiBody)({
        type: create_agent_dto_1.CreateAgentDto,
        description: 'Json structure for request payload',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Create agent',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '67484835c95cd2fe2f0ac63e' },
                agentId: { type: 'number', example: 52520059 },
                userId: { type: 'string', example: '67484835c95cd2fe2f0ac63d' },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-11-28T10:38:45.906Z',
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-11-28T10:38:45.906Z',
                },
                deletedAt: { type: 'string', nullable: true, example: null },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getUser_1.GetSessionUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_dto_1.CreateAgentDto, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch all agents with pagination',
        schema: {
            type: 'object',
            properties: {
                agents: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '6742722249c6bcb5fb8b296f' },
                            agentId: { type: 'number', example: 94350766 },
                            userId: { type: 'string', example: '6742722249c6bcb5fb8b296e' },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-11-24T00:24:02.180Z',
                            },
                            updatedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-11-24T00:24:02.180Z',
                            },
                            deletedAt: { type: 'string', nullable: true, example: null },
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '6742722249c6bcb5fb8b296e' },
                                    firstname: { type: 'string', example: 'daniel' },
                                    lastname: { type: 'string', example: 'paul' },
                                    username: { type: 'string', nullable: true, example: null },
                                    password: { type: 'string', example: '$argon2id$...' },
                                    email: { type: 'string', example: 'john.doe12@example.com' },
                                    phone: { type: 'string', nullable: true, example: null },
                                    location: { type: 'string', example: '1234 Street' },
                                    addressType: { type: 'string', example: 'HOME' },
                                    staffId: { type: 'string', nullable: true, example: null },
                                    longitude: { type: 'string', nullable: true, example: null },
                                    latitude: { type: 'string', nullable: true, example: null },
                                    emailVerified: { type: 'boolean', example: true },
                                    isBlocked: { type: 'boolean', example: false },
                                    status: { type: 'string', example: 'barred' },
                                    roleId: {
                                        type: 'string',
                                        example: '670189eb3253ce51203d2c03',
                                    },
                                    createdAt: {
                                        type: 'string',
                                        format: 'date-time',
                                        example: '2024-11-24T00:24:02.162Z',
                                    },
                                    updatedAt: {
                                        type: 'string',
                                        format: 'date-time',
                                        example: '2024-11-24T00:24:02.162Z',
                                    },
                                    deletedAt: { type: 'string', nullable: true, example: null },
                                    lastLogin: { type: 'string', nullable: true, example: null },
                                },
                            },
                        },
                    },
                },
                total: { type: 'number', example: 3 },
                page: { type: 'number', example: 1 },
                lastPage: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch all agents with pagination',
        description: 'Fetch all agents with pagination',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, swagger_1.ApiExtraModels)(get_agent_dto_1.GetAgentsDto),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_agent_dto_1.GetAgentsDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAllAgents", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID of the agent to fetch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Details of an agent',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '6742722249c6bcb5fb8b296f' },
                agentId: { type: 'number', example: 94350766 },
                userId: { type: 'string', example: '6742722249c6bcb5fb8b296e' },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-11-24T00:24:02.180Z',
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-11-24T00:24:02.180Z',
                },
                deletedAt: { type: 'string', nullable: true, example: null },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '6742722249c6bcb5fb8b296e' },
                        firstname: { type: 'string', example: 'daniel' },
                        lastname: { type: 'string', example: 'paul' },
                        username: { type: 'string', nullable: true, example: null },
                        password: { type: 'string', example: '$argon2id$...' },
                        email: { type: 'string', example: 'john.doe12@example.com' },
                        phone: { type: 'string', nullable: true, example: null },
                        location: { type: 'string', example: '1234 Street' },
                        addressType: { type: 'string', example: 'HOME' },
                        staffId: { type: 'string', nullable: true, example: null },
                        longitude: { type: 'string', nullable: true, example: null },
                        latitude: { type: 'string', nullable: true, example: null },
                        emailVerified: { type: 'boolean', example: true },
                        isBlocked: { type: 'boolean', example: false },
                        status: { type: 'string', example: 'barred' },
                        roleId: { type: 'string', example: '670189eb3253ce51203d2c03' },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-11-24T00:24:02.162Z',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-11-24T00:24:02.162Z',
                        },
                        deletedAt: { type: 'string', nullable: true, example: null },
                        lastLogin: { type: 'string', nullable: true, example: null },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Agent not found.',
    }),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch agent details',
        description: 'This endpoint allows a permitted user fetch a agent details.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Agent statistics',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', example: 3 },
                active: { type: 'number', example: 2 },
                barred: { type: 'number', example: 1 },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Agent statistics',
        description: 'Fetch Agent statistics',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('/statistics/view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgentsStatistics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesAndPermissionsGuard),
    (0, roles_decorator_1.RolesAndPermissions)({
        permissions: [`${client_1.ActionEnum.manage}:${client_1.SubjectEnum.Agents}`],
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'JWT token used for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer <token>',
        },
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Agent id to fetch tabs',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fetch Agent statistics',
        isArray: true,
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'Agents Details' },
                    url: {
                        type: 'string',
                        example: '/agent/6742722249c6bcb5fb8b296f/details',
                    },
                    count: { type: 'number', nullable: true, example: null },
                },
                examples: {
                    fixedExample: {
                        value: [
                            {
                                name: 'Agents Details',
                                url: '/agent/6742722249c6bcb5fb8b296f/details',
                            },
                            {
                                name: 'Customers',
                                url: '/agent/6742722249c6bcb5fb8b296f/customers',
                                count: 0,
                            },
                            {
                                name: 'Inventory',
                                url: '/agent/6742722249c6bcb5fb8b296f/inventory',
                                count: 0,
                            },
                            {
                                name: 'Transactions',
                                url: '/agent/6742722249c6bcb5fb8b296f/transactions',
                                count: 0,
                            },
                            {
                                name: 'Stats',
                                url: '/agent/6742722249c6bcb5fb8b296f/stats',
                            },
                            {
                                name: 'Sales',
                                url: '/agent/6742722249c6bcb5fb8b296f/sales',
                                count: 0,
                            },
                            {
                                name: 'Tickets',
                                url: '/agent/6742722249c6bcb5fb8b296f/tickets',
                                count: 0,
                            },
                        ],
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Agent Tabs for a particular agent',
        description: 'Fetch Agent Tabs for a particular agent',
    }),
    (0, swagger_1.ApiBadRequestResponse)({}),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)(':id/tabs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getInventoryTabs", null);
exports.AgentsController = AgentsController = __decorate([
    (0, swagger_1.ApiTags)('Agents'),
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agents_service_1.AgentsService])
], AgentsController);
//# sourceMappingURL=agents.controller.js.map