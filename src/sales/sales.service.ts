import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesDto, SaleItemDto } from './dto/create-sales.dto';
import { PaymentMode, SalesStatus } from '@prisma/client';
import { ValidateSaleProductItemDto } from './dto/validate-sale-product.dto';
import { ContractService } from '../contract/contract.service';
import { PaymentService } from '../payment/payment.service';
import { PaginationQueryDto } from 'src/utils/dto/pagination.dto';

interface ProcessedSaleItem extends SaleItemDto {
  totalPrice: number;
  monthlyPayment?: number;
  totalPayableAmount?: number;
  batchAllocation?: BatchAllocation[];
}

interface BatchAllocation {
  batchId: string;
  quantity: number;
  price: number;
}

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contractService: ContractService,
    private readonly paymentService: PaymentService,
  ) {}

  async createSale(creatorId: string, dto: CreateSalesDto) {
    const financialSettings = await this.prisma.financialSettings.findFirst();
    if (!financialSettings) {
      throw new BadRequestException('Financial settings not configured');
    }

    // Validate inventory availability
    await this.validateSaleProductQuantity(dto.saleItems);

    const processedItems: ProcessedSaleItem[] = [];
    for (const item of dto.saleItems) {
      const processedItem = await this.calculateItemPrice(
        item,
        financialSettings,
      );
      processedItems.push(processedItem);
    }

    const totalAmount = processedItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const hasInstallmentItems = processedItems.some(
      (item) => item.paymentMode === PaymentMode.INSTALLMENT,
    );

    if (hasInstallmentItems && !dto.bvn) {
      throw new BadRequestException(`Bvn is required for installment payments`);
    }
    if (
      hasInstallmentItems &&
      (!dto.nextOfKinDetails ||
        !dto.identificationDetails ||
        !dto.guarantorDetails)
    ) {
      throw new BadRequestException(
        'Contract details are required for installment payments',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      const sale = await prisma.sales.create({
        data: {
          category: dto.category,
          customerId: dto.customerId,
          totalPrice: totalAmount,
          status: SalesStatus.UNPAID,
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
      }

      if (hasInstallmentItems) {
        const totalInitialPayment = processedItems
          .filter((item) => item.paymentMode === PaymentMode.INSTALLMENT)
          .reduce((sum, item) => sum + item.installmentStartingPrice, 0);

        const contract = await this.contractService.createContract(
          dto,
          totalInitialPayment,
        );

        await prisma.sales.update({
          where: { id: sale.id },
          data: { contractId: contract.id },
        });

        const tempAccountDetails =
          await this.paymentService.generateStaticAccount(
            sale.id,
            5000,
            sale.customer.email,
            '4', // duration
            dto.bvn,
          );
        await prisma.installmentAccountDetails.create({
          data: {
            sales: {
              connect: { id: sale.id },
            },
            flw_ref: tempAccountDetails.flw_ref,
            order_ref: tempAccountDetails.order_ref,
            account_number: tempAccountDetails.account_number,
            account_status: tempAccountDetails.account_status,
            frequency: tempAccountDetails.frequency,
            bank_name: tempAccountDetails.bank_name,
            expiry_date: tempAccountDetails.expiry_date,
            note: tempAccountDetails.note,
            amount: tempAccountDetails.amount,
          },
        });
      }

      await this.handleInventoryUpdate(sale.id, totalAmount);

      return await this.paymentService.generatePaymentPayload(
        sale.id,
        totalAmount,
        sale.customer.email,
      );
    });
  }

  async getAllSales(query: PaginationQueryDto) {
    const { page = 1, limit = 100 } = query;
    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const totalCount = await this.prisma.saleItem.count();

    const saleItems = await this.prisma.saleItem.findMany({
      include: {
        sale: {
          include: { customer: true },
        },
        SaleRecipient: true,
      },
      skip,
      take,
    });

    return {
      saleItems,
      total: totalCount,
      page,
      limit,
      totalPages: limitNumber === 0 ? 0 : Math.ceil(totalCount / limitNumber),
    };
  }

  async getSale(id: string) {
    const saleItem = await this.prisma.saleItem.findUnique({
      where: {
        id,
      },
      include: {
        sale: {
          include: {
            customer: true,
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

    if (!saleItem) return new BadRequestException(`saleItem ${id} not found`);

    return saleItem;
  }

  async getMargins() {
    return await this.prisma.financialSettings.findFirst();
  }

  private async calculateItemPrice(
    saleItem: SaleItemDto,
    financialSettings: any,
  ): Promise<ProcessedSaleItem> {
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
      throw new NotFoundException(`Product not found`);
    }

    // Calculate price using multiple batches if needed
    const batchAllocations: BatchAllocation[] = [];
    let totalBasePrice = 0;

    for (const productInventory of product.inventories) {
      let remainingQuantity = saleItem.quantity;

      for (const batch of productInventory.inventory.batches) {
        if (remainingQuantity <= 0) break;

        const quantityFromBatch = Math.min(
          remainingQuantity,
          batch.remainingQuantity,
        );

        if (quantityFromBatch > 0) {
          batchAllocations.push({
            batchId: batch.id,
            quantity: quantityFromBatch,
            price: batch.price,
          });

          totalBasePrice += batch.price * quantityFromBatch;
          remainingQuantity -= quantityFromBatch;
        }
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Insufficient inventory for product ${saleItem.productId}`,
        );
      }
    }

    // Add miscellaneous prices
    const miscTotal = saleItem.miscellaneousPrices
      ? Object.values(saleItem.miscellaneousPrices).reduce(
          (sum: number, value: number) => sum + Number(value),
          0,
        )
      : 0;

    // Apply discount if any
    const discountAmount = saleItem.discount
      ? (totalBasePrice * Number(saleItem.discount)) / 100
      : 0;

    const totalPrice = totalBasePrice - discountAmount + miscTotal;

    const processedItem: ProcessedSaleItem = {
      ...saleItem,
      totalPrice,
      batchAllocation: batchAllocations,
    };

    if (saleItem.paymentMode === PaymentMode.ONE_OFF) {
      processedItem.totalPrice *= 1 + financialSettings.outrightMargin;
    } else {
      if (!saleItem.installmentDuration || !saleItem.installmentStartingPrice) {
        throw new BadRequestException(
          'Installment duration and starting price are required for installment payments',
        );
      }

      const principal = totalPrice;
      const monthlyInterestRate = financialSettings.monthlyInterest;
      const numberOfMonths = saleItem.installmentDuration;
      const loanMargin = financialSettings.loanMargin;

      const totalInterest = principal * monthlyInterestRate * numberOfMonths;
      const totalWithMargin = (principal + totalInterest) * (1 + loanMargin);

      processedItem.totalPayableAmount = totalWithMargin;
      processedItem.monthlyPayment =
        (totalWithMargin - saleItem.installmentStartingPrice) / numberOfMonths;
    }

    return processedItem;
  }

  async handleInventoryUpdate(saleId: string, paymentAmount: number) {
    return this.prisma.$transaction(async (prisma) => {
      const sale = await prisma.sales.findUnique({
        where: { id: saleId },
        include: {
          saleItems: {
            include: {
              product: true,
              devices: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      // Process inventory deduction for each sale item
      for (const saleItem of sale.saleItems) {
        const { devices, miscellaneousPrices, ...rest } = saleItem;

        const processedItem = await this.calculateItemPrice(
          {
            ...rest,
            miscellaneousPrices: miscellaneousPrices as Record<string, string>,
            devices: devices.map(({ id }) => id),
          },
          await prisma.financialSettings.findFirst(),
        );

        // Deduct from inventory batches
        for (const allocation of processedItem.batchAllocation) {
          await prisma.inventoryBatch.update({
            where: { id: allocation.batchId },
            data: {
              remainingQuantity: {
                decrement: allocation.quantity,
              },
            },
          });
        }
      }

      return sale;
    });
  }

  async validateSaleProductQuantity(
    saleProducts: ValidateSaleProductItemDto[],
  ) {
    const validationResults = [];
    const insufficientProducts: { productId: string }[] = [];

    // Create a map to track allocated quantities per inventory
    const inventoryAllocationMap = new Map<string, number>();

    // Fetch all product inventories for the given products in one query
    const productIds = saleProducts.map((saleProduct) => saleProduct.productId);

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

    const validProductIds = new Set(products.map((product) => product.id));
    const invalidProductIds = productIds.filter(
      (id) => !validProductIds.has(id),
    );

    if (invalidProductIds.length > 0) {
      throw new BadRequestException(
        `Invalid Product IDs: ${invalidProductIds.join(', ')}`,
      );
    }

    for (const saleProduct of saleProducts) {
      const { productId, quantity } = saleProduct;
      const product = products.find((p) => p.id === productId);

      if (!product) {
        throw new BadRequestException(`Product not found: ${productId}`);
      }

      let totalAvailableQuantity = 0;
      const inventoryBreakdown = [];

      // Check each inventory associated with the product
      for (const productInventory of product.inventories) {
        const inventory = productInventory.inventory;
        const currentInventoryId = inventory.id;

        // Get already allocated quantity for this inventory
        const allocatedQuantity =
          inventoryAllocationMap.get(currentInventoryId) || 0;
        let availableInventoryQuantity = 0;

        const batchesBreakdown = [];

        // Calculate available quantity from batches
        for (const batch of inventory.batches) {
          const remainingAfterAllocation = batch.remainingQuantity;
          if (remainingAfterAllocation > 0) {
            availableInventoryQuantity += remainingAfterAllocation;
            batchesBreakdown.push({
              batchId: batch.id,
              remainingQuantity: remainingAfterAllocation,
            });
          }
        }

        // Subtract already allocated quantity
        availableInventoryQuantity -= allocatedQuantity;

        totalAvailableQuantity += availableInventoryQuantity;

        const requiredInventoryQuantity = quantity * productInventory.quantity;

        inventoryBreakdown.push({
          inventoryId: currentInventoryId,
          availableQuantity: availableInventoryQuantity,
          requiredQuantity: requiredInventoryQuantity,
          batches: batchesBreakdown,
        });
      }

      // Store validation result
      validationResults.push({
        productId,
        availableQuantity: totalAvailableQuantity,
        requiredQuantity: quantity,
        inventoryBreakdown,
      });

      // Check if available quantity is sufficient
      if (totalAvailableQuantity < quantity) {
        insufficientProducts.push({ productId });
        continue;
      }

      // If sufficient, update allocation map
      let remainingToAllocate = quantity;
      for (const inventory of inventoryBreakdown) {
        if (remainingToAllocate <= 0) break;

        const quantityToAllocate = Math.min(
          remainingToAllocate,
          inventory.availableQuantity,
        );
        const currentAllocation =
          inventoryAllocationMap.get(inventory.inventoryId) || 0;
        inventoryAllocationMap.set(
          inventory.inventoryId,
          currentAllocation + quantityToAllocate,
        );
        remainingToAllocate -= quantityToAllocate;
      }
    }

    if (insufficientProducts.length) {
      throw new BadRequestException({
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
}
