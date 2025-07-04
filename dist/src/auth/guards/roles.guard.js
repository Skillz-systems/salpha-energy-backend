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
exports.RolesAndPermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const constants_1 = require("../../constants");
const client_1 = require("@prisma/client");
let RolesAndPermissionsGuard = class RolesAndPermissionsGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const rolesDecoratorValues = this.reflector.get('roles', context.getHandler());
        const requiredRoles = rolesDecoratorValues?.roles || [];
        const requiredPermissions = rolesDecoratorValues.permissions || [];
        if (!requiredRoles && !requiredPermissions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        if (!Array.isArray(requiredRoles)) {
            throw new common_1.ForbiddenException(constants_1.MESSAGES.ROLES_METADATA_INVALID);
        }
        if (!Array.isArray(requiredPermissions)) {
            throw new common_1.ForbiddenException(constants_1.MESSAGES.PERMISSIONS_METADATA_INVALID);
        }
        const userRole = user.role.role;
        if (userRole == "admin" || userRole == "super-admin") {
            return true;
        }
        const hasRequiredRoles = requiredRoles.length
            ? requiredRoles.includes(userRole)
            : true;
        const userPermissions = await this.getUserPermissions(user.roleId);
        const hasRequiredPermissions = requiredPermissions.length
            ? requiredPermissions.some((requiredPermission) => userPermissions.some((userPermission) => {
                const [action, subject] = userPermission.split(':');
                return subject === client_1.SubjectEnum.all && action == client_1.ActionEnum.manage;
            }) || userPermissions.includes(requiredPermission))
            : true;
        if (!(hasRequiredRoles && hasRequiredPermissions)) {
            throw new common_1.ForbiddenException(constants_1.MESSAGES.NOT_PERMITTED);
        }
        return true;
    }
    async getUserPermissions(roleId) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: { permissions: true },
        });
        if (!role) {
            throw new common_1.ForbiddenException(constants_1.MESSAGES.ROLE_NOT_FOUND);
        }
        return role.permissions.map((permission) => `${permission.action}:${permission.subject}`);
    }
};
exports.RolesAndPermissionsGuard = RolesAndPermissionsGuard;
exports.RolesAndPermissionsGuard = RolesAndPermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], RolesAndPermissionsGuard);
//# sourceMappingURL=roles.guard.js.map