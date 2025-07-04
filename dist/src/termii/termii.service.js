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
var TermiiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermiiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TermiiService = TermiiService_1 = class TermiiService {
    constructor(config, httpService) {
        this.config = config;
        this.httpService = httpService;
        this.logger = new common_1.Logger(TermiiService_1.name);
        this.baseUrl = 'https://v3.api.termii.com/api';
        this.apiKey = this.config.get('TERMII_API_KEY');
        this.senderId = this.config.get('TERMII_SENDER_ID', 'Energy');
        if (!this.apiKey) {
            this.logger.warn('TERMII_API_KEY not configured. SMS functionality will be disabled.');
        }
    }
    async sendSms(options) {
        if (!this.apiKey) {
            this.logger.warn('SMS not sent - TERMII_API_KEY not configured');
            return { success: false, message: 'SMS service not configured' };
        }
        try {
            const payload = {
                to: this.formatPhoneNumber(options.to),
                from: options.from || this.senderId,
                sms: options.message,
                type: options.type || 'plain',
                channel: options.channel || 'generic',
                api_key: this.apiKey,
            };
            this.logger.log(`Sending SMS to ${payload.to}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/sms/send`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`SMS sent successfully to ${payload.to}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${options.to}:`, error.response?.data || error.message);
            throw new Error(`SMS sending failed: ${error.response?.data?.message || error.message}`);
        }
    }
    async sendDeviceTokensSms(phoneNumber, deviceTokens, customerName) {
        const message = this.formatDeviceTokensMessage(deviceTokens, customerName);
        return this.sendSms({
            to: phoneNumber,
            message,
            type: 'plain',
            channel: 'generic',
        });
    }
    formatDeviceTokensMessage(deviceTokens, customerName) {
        const greeting = customerName ? `Dear ${customerName},` : 'Dear Customer,';
        let message = `${greeting}\n\nYour device tokens are ready:\n\n`;
        deviceTokens.forEach((device, index) => {
            message += `${index + 1}. Device: ${device.deviceSerialNumber}\n`;
            message += `   Token: ${device.deviceToken}\n`;
            if (device.deviceName) {
                message += `   Name: ${device.deviceName}\n`;
            }
            message += `\n`;
        });
        message += `Keep these tokens safe. You'll need them to activate your devices.\n\n`;
        message += `For support, contact us.\n\nThank you!`;
        if (message.length > 1600) {
            message =
                message.substring(0, 1550) +
                    '...\n\nFor full details, check your email.';
        }
        return message;
    }
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '234' + cleaned.substring(1);
        }
        else if (!cleaned.startsWith('234')) {
            cleaned = '234' + cleaned;
        }
        return cleaned;
    }
    async getAccountBalance() {
        if (!this.apiKey) {
            throw new Error('TERMII_API_KEY not configured');
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/get-balance?api_key=${this.apiKey}`));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get account balance:', error.response?.data || error.message);
            throw new Error(`Failed to get balance: ${error.response?.data?.message || error.message}`);
        }
    }
    async testSmsConnection() {
        try {
            return this.getAccountBalance();
        }
        catch (error) {
            this.logger.error('SMS connection test failed:', error.message);
            return false;
        }
    }
};
exports.TermiiService = TermiiService;
exports.TermiiService = TermiiService = TermiiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], TermiiService);
//# sourceMappingURL=termii.service.js.map