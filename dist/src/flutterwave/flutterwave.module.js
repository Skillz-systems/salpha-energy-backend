"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveModule = void 0;
const common_1 = require("@nestjs/common");
const flutterwave_service_1 = require("./flutterwave.service");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let FlutterwaveModule = class FlutterwaveModule {
};
exports.FlutterwaveModule = FlutterwaveModule;
exports.FlutterwaveModule = FlutterwaveModule = __decorate([
    (0, common_1.Module)({
        providers: [flutterwave_service_1.FlutterwaveService, config_1.ConfigService, prisma_service_1.PrismaService],
    })
], FlutterwaveModule);
//# sourceMappingURL=flutterwave.module.js.map