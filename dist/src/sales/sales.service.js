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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const contract_service_1 = require("../contract/contract.service");
const payment_service_1 = require("../payment/payment.service");
let SalesService = class SalesService {
    constructor(prisma, contractService, paymentService) {
        this.prisma = prisma;
        this.contractService = contractService;
        this.paymentService = paymentService;
    }
    async createSale(creatorId, dto) {
        await this.validateSalesRelations(dto);
        await this.validateSaleProductQuantity(dto.saleItems);
        const financialSettings = await this.prisma.financialSettings.findFirst();
        if (!financialSettings) {
            throw new common_1.BadRequestException('Financial settings not configured');
        }
        const processedItems = [];
        for (const item of dto.saleItems) {
            const processedItem = await this.calculateItemPrice(item, financialSettings, dto.applyMargin);
            processedItems.push(processedItem);
        }
        const totalAmount = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalAmountToPay = processedItems.reduce((sum, item) => sum + (item.installmentTotalPrice || item.totalPrice), 0);
        const totalInstallmentStartingPrice = processedItems.reduce((sum, item) => sum + (item.installmentTotalPrice || 0), 0);
        const totalInstallmentDuration = processedItems.reduce((sum, item) => sum + (item.duration || 0), 0);
        const totalMonthlyPayment = processedItems.reduce((sum, item) => sum + (item.monthlyPayment || 0), 0);
        const hasInstallmentItems = processedItems.some((item) => item.paymentMode === client_1.PaymentMode.INSTALLMENT);
        if (hasInstallmentItems && !dto.bvn) {
            throw new common_1.BadRequestException(`Bvn is required for installment payments`);
        }
        if (hasInstallmentItems &&
            (!dto.nextOfKinDetails ||
                !dto.identificationDetails ||
                !dto.guarantorDetails)) {
            throw new common_1.BadRequestException('Contract details are required for installment payments');
        }
        let sale;
        await this.prisma.$transaction(async (prisma) => {
            sale = await prisma.sales.create({
                data: {
                    category: dto.category,
                    customerId: dto.customerId,
                    totalPrice: totalAmount,
                    installmentStartingPrice: totalInstallmentStartingPrice,
                    totalInstallmentDuration,
                    totalMonthlyPayment,
                    paymentMethod: dto.paymentMethod,
                    status: client_1.SalesStatus.UNPAID,
                    batchAllocations: {
                        createMany: {
                            data: processedItems.flatMap(({ batchAllocation }) => batchAllocation.map(({ batchId, price, quantity }) => ({
                                inventoryBatchId: batchId,
                                price,
                                quantity,
                            }))),
                        },
                    },
                    creatorId,
                },
                include: {
                    customer: true,
                },
            });
            for (const item of processedItems) {
                await prisma.saleItem.create({
                    data: {
                        sale: {
                            connect: {
                                id: sale.id,
                            },
                        },
                        product: {
                            connect: {
                                id: item.productId,
                            },
                        },
                        paymentMode: item.paymentMode,
                        discount: item.discount,
                        quantity: item.quantity,
                        totalPrice: item.totalPrice,
                        miscellaneousPrices: item.miscellaneousPrices,
                        installmentDuration: item.installmentDuration,
                        installmentStartingPrice: item.installmentStartingPrice,
                        devices: {
                            connect: item.devices.map((deviceId) => ({ id: deviceId })),
                        },
                        ...(item.saleRecipient && {
                            SaleRecipient: {
                                create: item.saleRecipient,
                            },
                        }),
                    },
                });
                for (const allocation of item.batchAllocation) {
                    await this.prisma.inventoryBatch.update({
                        where: { id: allocation.batchId },
                        data: {
                            remainingQuantity: {
                                decrement: allocation.quantity,
                            },
                        },
                    });
                }
            }
        });
        const transactionRef = `sale-${sale.id}-${Date.now()}`;
        if (hasInstallmentItems) {
            const totalInitialPayment = processedItems
                .filter((item) => item.paymentMode === client_1.PaymentMode.INSTALLMENT)
                .reduce((sum, item) => sum + item.installmentStartingPrice, 0);
            const contract = await this.contractService.createContract(dto, totalInitialPayment);
            await this.prisma.sales.update({
                where: { id: sale.id },
                data: { contractId: contract.id },
            });
        }
        return await this.paymentService.generatePaymentPayload(sale.id, totalAmountToPay, sale.customer.email, transactionRef, dto.paymentMethod);
    }
    async getAllSales(query) {
        const { page = 1, limit = 100 } = query;
        const pageNumber = parseInt(String(page), 10);
        const limitNumber = parseInt(String(limit), 10);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const whereClause = {};
        if (query.paymentMethod) {
            whereClause.sale = {
                paymentMethod: query.paymentMethod,
            };
        }
        console.log({ query, whereClause });
        const [totalCount, saleItems] = await Promise.all([
            this.prisma.saleItem.count({
                where: whereClause,
            }),
            this.prisma.saleItem.findMany({
                where: whereClause,
                include: {
                    sale: {
                        include: {
                            customer: true,
                            payment: {
                                include: {
                                    recordedBy: {
                                        select: {
                                            id: true,
                                            firstname: true,
                                            lastname: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    devices: true,
                    SaleRecipient: true,
                    product: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            }),
        ]);
        return {
            saleItems,
            total: totalCount,
            page: pageNumber,
            limit: limitNumber,
            totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
        };
    }
    async getSale(id) {
        const saleItem = await this.prisma.saleItem.findUnique({
            where: {
                id,
            },
            include: {
                sale: {
                    include: {
                        customer: true,
                        payment: true,
                        installmentAccountDetails: true,
                    },
                },
                devices: {
                    include: {
                        tokens: true,
                    },
                },
                product: {
                    include: {
                        inventories: {
                            include: {
                                inventory: true,
                            },
                        },
                    },
                },
                SaleRecipient: true,
            },
        });
        if (!saleItem)
            return new common_1.BadRequestException(`saleItem ${id} not found`);
        return saleItem;
    }
    async recordCashPayment(recordedById, dto) {
        const sale = await this.prisma.sales.findUnique({
            where: { id: dto.saleId },
            include: {
                customer: true,
                saleItems: {
                    include: {
                        product: true,
                        devices: true,
                    },
                },
            },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        if (sale.paymentMethod !== client_1.PaymentMethod.CASH) {
            throw new common_1.BadRequestException('This sale is not configured for cash payments');
        }
        if (sale.status === client_1.SalesStatus.COMPLETED) {
            throw new common_1.BadRequestException('This sale is already completed');
        }
        if (sale.status === client_1.SalesStatus.CANCELLED) {
            throw new common_1.BadRequestException('This sale has been cancelled');
        }
        const remainingAmount = sale.totalPrice - sale.totalPaid;
        if (dto.amount > Math.ceil(remainingAmount)) {
            throw new common_1.BadRequestException(`Payment amount (${dto.amount}) exceeds remaining balance (${Math.ceil(remainingAmount)})`);
        }
        const transactionRef = `cash-${sale.id}-${Date.now()}`;
        return await this.prisma.payment.create({
            data: {
                saleId: dto.saleId,
                amount: dto.amount,
                paymentMethod: client_1.PaymentMethod.CASH,
                transactionRef,
                paymentStatus: client_1.PaymentStatus.COMPLETED,
                recordedById,
                notes: dto.notes,
                paymentDate: new Date(),
            },
        });
    }
    async getSalesPaymentDetails(saleId) {
        const sale = await this.prisma.sales.findFirst({
            where: {
                id: saleId,
            },
            include: {
                customer: true,
                saleItems: {
                    include: {
                        devices: true,
                    },
                },
            },
        });
        const transactionRef = `sale-${sale.id}-${Date.now()}`;
        return await this.paymentService.generatePaymentPayload(sale.id, sale.installmentStartingPrice || sale.totalPrice, sale.customer.email, transactionRef);
    }
    async getMargins() {
        return await this.prisma.financialSettings.findFirst();
    }
    async createFinMargin(body) {
        await this.prisma.financialSettings.create({
            data: body,
        });
    }
    async calculateItemPrice(saleItem, financialSettings, applyMargin) {
        const product = await this.prisma.product.findUnique({
            where: { id: saleItem.productId },
            include: {
                inventories: {
                    include: {
                        inventory: {
                            include: {
                                batches: {
                                    where: { remainingQuantity: { gt: 0 } },
                                    orderBy: { createdAt: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        const { batchAllocations, totalBasePrice } = await this.processBatches(product, saleItem.quantity, applyMargin);
        const miscTotal = saleItem.miscellaneousPrices
            ? Object.values(saleItem.miscellaneousPrices).reduce((sum, value) => sum + Number(value), 0)
            : 0;
        const discountAmount = saleItem.discount
            ? (totalBasePrice * Number(saleItem.discount)) / 100
            : 0;
        const totalPrice = totalBasePrice - discountAmount + miscTotal;
        const processedItem = {
            ...saleItem,
            totalPrice,
            batchAllocation: batchAllocations,
        };
        if (saleItem.paymentMode === client_1.PaymentMode.ONE_OFF) {
            if (applyMargin)
                processedItem.totalPrice *= 1 + financialSettings.outrightMargin;
        }
        else {
            if (!saleItem.installmentDuration || !saleItem.installmentStartingPrice) {
                throw new common_1.BadRequestException('Installment duration and starting price are required for installment payments');
            }
            const principal = totalPrice;
            const monthlyInterestRate = financialSettings.monthlyInterest;
            const numberOfMonths = saleItem.installmentDuration;
            const loanMargin = applyMargin ? financialSettings.loanMargin : 0;
            const totalInterest = principal * monthlyInterestRate * numberOfMonths;
            const totalWithMargin = (principal + totalInterest) * (1 + loanMargin);
            const installmentTotalPrice = saleItem.installmentStartingPrice
                ? (totalWithMargin * Number(saleItem.installmentStartingPrice)) / 100
                : 0;
            processedItem.totalPrice = totalWithMargin;
            processedItem.installmentTotalPrice = installmentTotalPrice;
            processedItem.monthlyPayment =
                (totalWithMargin - installmentTotalPrice) / numberOfMonths;
        }
        return processedItem;
    }
    async processBatches(product, requiredQuantity, applyMargin) {
        const batchAllocations = [];
        let totalBasePrice = 0;
        for (const productInventory of product.inventories) {
            const quantityPerProduct = productInventory.quantity;
            let remainingQuantity = requiredQuantity * quantityPerProduct;
            for (const batch of productInventory.inventory.batches) {
                if (remainingQuantity <= 0)
                    break;
                const quantityFromBatch = Math.min(batch.remainingQuantity, remainingQuantity);
                const batchPrice = applyMargin ? batch.costOfItem || 0 : batch.price;
                if (quantityFromBatch > 0) {
                    batchAllocations.push({
                        batchId: batch.id,
                        quantity: quantityFromBatch,
                        price: batchPrice,
                    });
                    totalBasePrice += batchPrice * quantityFromBatch;
                    remainingQuantity -= quantityFromBatch;
                }
            }
            if (remainingQuantity > 0) {
                throw new common_1.BadRequestException(`Insufficient inventory for product ${product.id}`);
            }
        }
        return { batchAllocations, totalBasePrice };
    }
    async validateSalesRelations(dto) {
        const customer = await this.prisma.customer.findUnique({
            where: {
                id: dto.customerId,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer wth ID: ${dto.customerId} not found`);
        }
        let invalidDeviceId;
        for (const saleItem of dto.saleItems) {
            if (invalidDeviceId)
                break;
            for (const id of saleItem.devices) {
                const deviceExists = await this.prisma.device.findUnique({
                    where: { id },
                });
                if (!deviceExists)
                    invalidDeviceId = id;
            }
        }
        if (invalidDeviceId)
            throw new common_1.BadRequestException(`Device wth ID: ${invalidDeviceId} not found`);
    }
    async validateSaleProductQuantity(saleProducts) {
        const inventoryAllocationMap = new Map();
        const productIds = saleProducts.map((p) => p.productId);
        if (new Set(productIds).size !== productIds.length) {
            throw new common_1.BadRequestException(`Duplicate product IDs are not allowed.`);
        }
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                inventories: {
                    include: {
                        inventory: {
                            include: {
                                batches: {
                                    where: { remainingQuantity: { gt: 0 } },
                                    orderBy: { createdAt: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });
        const validProductIds = new Set(products.map((p) => p.id));
        const invalidProductIds = productIds.filter((id) => !validProductIds.has(id));
        if (invalidProductIds.length) {
            throw new common_1.BadRequestException(`Invalid Product IDs: ${invalidProductIds.join(', ')}`);
        }
        const { validationResults, insufficientProducts } = this.processProducts(saleProducts, products, inventoryAllocationMap);
        if (insufficientProducts.length) {
            throw new common_1.BadRequestException({
                message: 'Insufficient inventory for products',
                defaultingProduct: insufficientProducts,
                validationDetails: validationResults,
            });
        }
        return {
            message: 'All products have sufficient inventory',
            success: true,
            validationDetails: validationResults,
        };
    }
    processProducts(saleProducts, products, inventoryAllocationMap) {
        const validationResults = [];
        const insufficientProducts = [];
        for (const { productId, quantity } of saleProducts) {
            const product = products.find((p) => p.id === productId);
            let maxPossibleUnits = Infinity;
            const inventoryBreakdown = product.inventories.map((productInventory) => {
                const { inventory, quantity: perProductInventoryQuantity } = productInventory;
                const requiredQuantityForInventory = perProductInventoryQuantity * quantity;
                let availableInventoryQuantity = inventory.batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
                availableInventoryQuantity -=
                    inventoryAllocationMap.get(inventory.id) || 0;
                maxPossibleUnits = Math.min(maxPossibleUnits, Math.floor(availableInventoryQuantity / perProductInventoryQuantity));
                return {
                    inventoryId: inventory.id,
                    availableInventoryQuantity,
                    requiredQuantityForInventory,
                };
            });
            validationResults.push({
                productId,
                requiredQuantity: quantity,
                inventoryBreakdown,
            });
            if (maxPossibleUnits < quantity) {
                insufficientProducts.push({ productId });
            }
            else {
                this.allocateInventory(inventoryBreakdown, quantity, inventoryAllocationMap);
            }
        }
        return { validationResults, insufficientProducts };
    }
    allocateInventory(inventoryBreakdown, quantity, inventoryAllocationMap) {
        let remainingToAllocate = quantity;
        for (const inventory of inventoryBreakdown) {
            if (remainingToAllocate <= 0)
                break;
            const quantityToAllocate = Math.min(remainingToAllocate, Math.floor(inventory.availableInventoryQuantity /
                inventory.requiredQuantityForInventory));
            const currentAllocation = inventoryAllocationMap.get(inventory.inventoryId) || 0;
            inventoryAllocationMap.set(inventory.inventoryId, currentAllocation +
                quantityToAllocate * inventory.requiredQuantityForInventory);
            remainingToAllocate -= quantityToAllocate;
        }
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        contract_service_1.ContractService,
        payment_service_1.PaymentService])
], SalesService);
//# sourceMappingURL=sales.service.js.map