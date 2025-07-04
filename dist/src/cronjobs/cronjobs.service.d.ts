import { PrismaService } from '../prisma/prisma.service';
export declare class CronjobsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly logger;
    checkUnpaidSales(): Promise<void>;
}
