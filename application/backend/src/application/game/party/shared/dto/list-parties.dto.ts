import type { UserId } from '../../../../../domain/identity/entities/user';
import type { PaginationQuery } from '../../../../../domain/shared/value-objects/pagination-query';

export interface ListPartiesDto extends PaginationQuery {
  readonly userId: UserId;
}
