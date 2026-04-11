import type { UserId } from '../../../../../domain/identity/entities/user';

export interface ListPartiesDto {
  readonly userId: UserId;
}
