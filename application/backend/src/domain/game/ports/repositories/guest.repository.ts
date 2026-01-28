import type { Guest } from '../../entities/guest';
import type { GuestId } from '../../entities/player-state';

export const GuestRepositoryProvider = Symbol('GuestRepository');

export interface GuestRepository {
  create(data: {
    id: GuestId;
    sessionId: number;
    username: string;
    avatarSeed: string;
  }): Promise<Guest>;
  findById(id: GuestId): Promise<Guest | null>;
}
