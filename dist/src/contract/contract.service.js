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
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ContractService = class ContractService {
    constructor(cloudinary, prisma) {
        this.cloudinary = cloudinary;
        this.prisma = prisma;
    }
    async createContract(dto, initialAmountPaid) {
        return await this.prisma.contract.create({
            data: {
                initialAmountPaid,
                nextOfKinFullName: dto.nextOfKinDetails.fullName,
                nextOfKinRelationship: dto.nextOfKinDetails.relationship,
                nextOfKinPhoneNumber: dto.nextOfKinDetails.phoneNumber,
                nextOfKinHomeAddress: dto.nextOfKinDetails.homeAddress,
                nextOfKinEmail: dto.nextOfKinDetails.email,
                nextOfKinDateOfBirth: dto.nextOfKinDetails.dateOfBirth,
                nextOfKinNationality: dto.nextOfKinDetails.nationality,
                guarantorFullName: dto.guarantorDetails.fullName,
                guarantorPhoneNumber: dto.guarantorDetails.phoneNumber,
                guarantorHomeAddress: dto.guarantorDetails.homeAddress,
                guarantorEmail: dto.guarantorDetails.email,
                guarantorIdType: dto.guarantorDetails.identificationDetails.idType,
                guarantorIdNumber: dto.guarantorDetails.identificationDetails.idNumber,
                guarantorIdIssuingCountry: dto.guarantorDetails.identificationDetails.issuingCountry,
                guarantorIdIssueDate: dto.guarantorDetails.identificationDetails.issueDate,
                guarantorIdExpirationDate: dto.guarantorDetails.identificationDetails.expirationDate,
                guarantorNationality: dto.guarantorDetails.nationality,
                guarantorDateOfBirth: dto.guarantorDetails.dateOfBirth,
                idType: dto.identificationDetails.idType,
                idNumber: dto.identificationDetails.idNumber,
                issuingCountry: dto.identificationDetails.issuingCountry,
                issueDate: dto.identificationDetails.issueDate,
                expirationDate: dto.identificationDetails.expirationDate,
                fullNameAsOnID: dto.identificationDetails.fullNameAsOnID,
                addressAsOnID: dto.identificationDetails.addressAsOnID,
            },
        });
    }
    async getAllContracts(query) {
        const { page = 1, limit = 100 } = query;
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const totalCount = await this.prisma.contract.count({
            where: {
                sale: {
                    some: {},
                },
            },
        });
        const contracts = await this.prisma.contract.findMany({
            where: {
                sale: {
                    some: {},
                },
            },
            include: {
                sale: {
                    include: {
                        customer: true,
                        saleItems: {
                            include: {
                                product: {
                                    include: {
                                        inventories: {
                                            include: {
                                                inventory: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            skip,
            take,
        });
        return {
            contracts,
            total: totalCount,
            page,
            limit,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async getContract(id) {
        const contract = await this.prisma.contract.findUnique({
            where: {
                id,
            },
            include: {
                sale: {
                    include: {
                        customer: true,
                        saleItems: {
                            include: {
                                SaleRecipient: true,
                                product: {
                                    include: {
                                        inventories: {
                                            include: {
                                                inventory: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!contract)
            return new common_1.BadRequestException(`Contract ${id} not found`);
        return contract;
    }
    async uploadSignage(id, file) {
        const contract = await this.prisma.contract.findUnique({
            where: {
                id,
            },
        });
        if (!contract)
            return new common_1.BadRequestException(`Contract ${id} not found`);
        if (contract.signedContractUrl)
            return new common_1.BadRequestException(`Contract ${id} already signed`);
        const signedContractUrl = (await this.uploadContractSignage(file))
            .secure_url;
        await this.prisma.contract.update({
            where: {
                id,
            },
            data: {
                signedContractUrl,
                signedAt: new Date(),
            },
        });
    }
    async uploadContractSignage(file) {
        return await this.cloudinary.uploadFile(file).catch((e) => {
            throw e;
        });
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        prisma_service_1.PrismaService])
], ContractService);
//# sourceMappingURL=contract.service.js.map