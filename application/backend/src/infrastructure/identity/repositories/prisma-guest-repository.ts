import { Injectable } from '@nestjs/common';
import type { Guest as PrismaGuest } from '@prisma/client';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { Guest, type GuestId } from '../../../domain/identity/entities/guest';
import type { GuestRepository } from '../../../domain/identity/ports/guest.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaGuestRepository implements GuestRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guestIdentifier: GuestIdentifier,
  ) {}

  async create(data: { id: GuestId; username: string; avatarSeed: string }): Promise<Guest> {
    const guest = await this.prisma.guest.create({
      data: {
        id: data.id,
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
      id: this.guestIdentifier.parse(guest.id),
      username: guest.username,
      avatarSeed: guest.avatarSeed,
      createdAt: guest.createdAt,
    });
  }
}
