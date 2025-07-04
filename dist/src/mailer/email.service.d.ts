import { MailerService } from '@nestjs-modules/mailer';
import { IMail } from './interfaces/mail.interface';
import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private readonly mailService;
    private readonly prisma;
    constructor(mailService: MailerService, prisma: PrismaService);
    sendMail(value: IMail): Promise<string>;
}
