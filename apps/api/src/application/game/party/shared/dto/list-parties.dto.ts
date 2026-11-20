import type { PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface ListPartiesDto extends PaginationQuery {
  readonly userId: UserId;
}
