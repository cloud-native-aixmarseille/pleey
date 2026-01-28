import { Injectable } from '@nestjs/common';
import type { Guest as PrismaGuest } from '@prisma/client';
import { Guest } from '../../../domain/game/entities/guest';
import type { GuestId } from '../../../domain/game/entities/player-state';
import type { GuestRepository } from '../../../domain/game/ports/repositories/guest.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaGuestRepository implements GuestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    id: GuestId;
    sessionId: number;
    username: string;
    avatarSeed: string;
  }): Promise<Guest> {
    const guest = await this.prisma.guest.create({
      data: {
        id: data.id,
        sessionId: data.sessionId,
        username: data.username,
        avatarSeed: data.avatarSeed,
      },
    });

    return this.toDomain(guest);
  }

  async findById(id: GuestId): Promise<Guest | null> {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    return guest ? this.toDomain(guest) : null;
  }

  private toDomain(guest: PrismaGuest): Guest {
    return Guest.create({
      id: guest.id,
      sessionId: guest.sessionId,
      username: guest.username,
      avatarSeed: guest.avatarSeed,
      createdAt: guest.createdAt,
    });
  }
}
