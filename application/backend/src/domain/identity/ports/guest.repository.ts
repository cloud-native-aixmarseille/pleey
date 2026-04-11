import type { Guest, GuestId } from '../entities/guest';

export const GuestRepositoryProvider = Symbol('GuestRepository');

export interface GuestRepository {
  create(data: { id: GuestId; username: string; avatarSeed: string }): Promise<Guest>;
  findById(id: GuestId): Promise<Guest | null>;
}
