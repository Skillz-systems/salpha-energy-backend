"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesAndPermissions = exports.PERMISSIONS_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.PERMISSIONS_KEY = 'permissions';
const RolesAndPermissions = (rolesArgs) => (0, common_1.SetMetadata)(exports.ROLES_KEY, rolesArgs);
exports.RolesAndPermissions = RolesAndPermissions;
//# sourceMappingURL=roles.decorator.js.map