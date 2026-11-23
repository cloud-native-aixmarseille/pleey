import type { PaginationQuery } from '@pleey/domain/shared/primitives';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface ListPartiesDto extends PaginationQuery {
  readonly userId: UserId;
}
