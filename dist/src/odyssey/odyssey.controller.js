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
var OdysseyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdysseyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const odyssey_dto_1 = require("./dto/odyssey.dto");
const odyssey_service_1 = require("./odyssey.service");
let OdysseyController = OdysseyController_1 = class OdysseyController {
    constructor(odysseyPaymentService) {
        this.odysseyPaymentService = odysseyPaymentService;
        this.logger = new common_1.Logger(OdysseyController_1.name);
    }
    async getPayments(authorization, fromDate, toDate, financingId, siteId, country) {
        try {
            if (!authorization || !authorization.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Invalid authorization header format');
            }
            const token = authorization.substring(7);
            await this.validateToken(token);
            if (!fromDate || !toDate) {
                throw new common_1.BadRequestException('FROM and TO parameters are required');
            }
            const from = this.parseAndValidateDate(fromDate, 'FROM');
            const to = this.parseAndValidateDate(toDate, 'TO');
            if (from >= to) {
                throw new common_1.BadRequestException('FROM date must be before TO date');
            }
            console.log(`Odyssey payment request: ${from.toISOString()} to ${to.toISOString()}` +
                (financingId ? ` [Financing: ${financingId}]` : '') +
                (siteId ? ` [Site: ${siteId}]` : '') +
                (country ? ` [Country: ${country}]` : ''));
            const result = await this.odysseyPaymentService.getPayments({
                from,
                to,
                financingId,
                siteId,
                country,
            });
            console.log(`Odyssey payment response: ${result.payments.length} payments found`);
            return result;
        }
        catch (error) {
            console.error('Error processing Odyssey payment request', error);
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            return {
                payments: [],
                errors: `Internal server error: ${error.message}`,
            };
        }
    }
    async validateToken(token) {
        const isValid = await this.odysseyPaymentService.validateApiToken(token);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid API token');
        }
    }
    parseAndValidateDate(dateString, paramName) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new common_1.BadRequestException(`Invalid ${paramName} date format. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.SSSZ`);
            }
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
            if (!iso8601Regex.test(dateString)) {
                throw new common_1.BadRequestException(`${paramName} date must be in ISO 8601 UTC format: YYYY-MM-DDTHH:mm:ss.SSSZ`);
            }
            return date;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Invalid ${paramName} date format. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.SSSZ`);
        }
    }
};
exports.OdysseyController = OdysseyController;
__decorate([
    (0, common_1.Get)('odyssey'),
    (0, swagger_1.ApiOperation)({
        summary: 'Odyssey Standard Payment API',
        description: `
      Returns payment data for a specified time period in Odyssey-compliant format.
      This endpoint provides payment information for Solar Home Systems (SHS) devices
      to enable verification by financial institutions.
      
      Authentication: Bearer token required in Authorization header.
      Date Range: Maximum 24 hours of data per request.
      Format: All timestamps in UTC using ISO 8601 format.
    `,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'Bearer token for authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer e25080c723345c3bbd0095f21a4f9efa808051a99c33a085415258535',
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'FROM',
        description: 'Start of date range (ISO 8601 format in UTC)',
        required: true,
        type: 'string',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'TO',
        description: 'End of date range (ISO 8601 format in UTC)',
        required: true,
        type: 'string',
        example: '2024-01-02T00:00:00.000Z',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'FINANCING_ID',
        description: 'Optional financing program ID filter',
        required: false,
        type: 'string',
        example: 'REA_NEP_OBF',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'SITE_ID',
        description: 'Optional site ID filter',
        required: false,
        type: 'string',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'COUNTRY',
        description: 'Optional country filter',
        required: false,
        type: 'string',
        example: 'NG',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment data retrieved successfully',
        type: odyssey_dto_1.OdysseyPaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing bearer token',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid date format or date range too large',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'Invalid date format or range' },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('FROM')),
    __param(2, (0, common_1.Query)('TO')),
    __param(3, (0, common_1.Query)('FINANCING_ID')),
    __param(4, (0, common_1.Query)('SITE_ID')),
    __param(5, (0, common_1.Query)('COUNTRY')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OdysseyController.prototype, "getPayments", null);
exports.OdysseyController = OdysseyController = OdysseyController_1 = __decorate([
    (0, swagger_1.ApiTags)('Odyssey Integration'),
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [odyssey_service_1.OdysseyService])
], OdysseyController);
//# sourceMappingURL=odyssey.controller.js.map