import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class PaginatedUsers {
  @ApiProperty({ type: UserEntity, isArray: true })
  users: UserEntity[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  constructor(partial: Partial<PaginatedUsers>) {
    Object.assign(this, partial);
  }
}
