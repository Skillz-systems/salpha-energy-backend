"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSessionUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetSessionUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
        throw new common_1.ForbiddenException('User not found');
    }
    if (data) {
        return user?.[data];
    }
    return user;
});
//# sourceMappingURL=getUser.js.map