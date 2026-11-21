import type { GuestId } from '@pleey/contracts/identity';
import type { Guest } from '../entities/guest';

export const GuestRepositoryProvider = Symbol('GuestRepository');

export interface GuestRepository {
  create(data: { id: GuestId; username: string; avatarSeed: string }): Promise<Guest>;
  findById(id: GuestId): Promise<Guest | null>;
  upsert(data: { id: GuestId; username: string; avatarSeed: string }): Promise<Guest>;
}
