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
exports.RolesEntity = void 0;
const class_transformer_1 = require("class-transformer");
const permissions_entity_1 = require("../../permissions/entity/permissions.entity");
const user_entity_1 = require("../../users/entity/user.entity");
class RolesEntity {
}
exports.RolesEntity = RolesEntity;
__decorate([
    (0, class_transformer_1.Type)(() => permissions_entity_1.PermissionEntity),
    __metadata("design:type", Array)
], RolesEntity.prototype, "permissions", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], RolesEntity.prototype, "creator", void 0);
//# sourceMappingURL=roles.entity.js.map