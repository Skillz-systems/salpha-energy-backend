"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenPayGoService = void 0;
const common_1 = require("@nestjs/common");
const openpaygo_1 = require("openpaygo");
const encoder = new openpaygo_1.Encoder();
let OpenPayGoService = class OpenPayGoService {
    async generateToken(data, days, deviceCount) {
        const token = encoder.generateToken({
            secretKeyHex: data.key,
            count: deviceCount,
            value: days !== -1 ? days : undefined,
            valueDivider: Number(data.timeDivider),
            restrictDigitSet: data.restrictedDigitMode,
            tokenType: days === -1 ? openpaygo_1.TokenTypes.DISABLE_PAYG : openpaygo_1.TokenTypes.ADD_TIME,
            startingCode: Number(data.startingCode),
        });
        return token;
    }
};
exports.OpenPayGoService = OpenPayGoService;
exports.OpenPayGoService = OpenPayGoService = __decorate([
    (0, common_1.Injectable)()
], OpenPayGoService);
//# sourceMappingURL=openpaygo.service.js.map