import { PaymentMethod } from '@prisma/client';
import { PaginationQueryDto } from '../../utils/dto/pagination.dto';
export declare class ListSalesQueryDto extends PaginationQueryDto {
    paymentMethod?: PaymentMethod;
}
