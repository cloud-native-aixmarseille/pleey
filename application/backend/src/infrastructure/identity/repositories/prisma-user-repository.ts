import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { User, UserId } from '../../../domain/identity/entities/user';
import type { UserRepository } from '../../../domain/identity/ports/user.repository';
import type { Media } from '../../../domain/media/entities/media';
import { createDomainError } from '../../../domain/shared/errors/domain-error';
import { PrismaService } from '../../database/prisma-service';
import { toDomainUser, USER_PROFILE_INCLUDE } from './prisma-user-profile-mapper';

const USER_PROFILE_UPDATE_USER_NOT_FOUND_ERROR = {
  code: 'USER_PROFILE_UPDATE_USER_NOT_FOUND',
  messageKey: 'USER_PROFILE_UPDATE_USER_NOT_FOUND',
} as const;

function toPrismaBytes(content: Buffer): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(content.byteLength);
  bytes.set(content);
  return bytes as Uint8Array<ArrayBuffer>;
}

function toAvatarMediaCreateInput(avatar: Media): Prisma.MediaCreateWithoutAvatarForUserInput {
  return {
    mimeType: avatar.mimeType,
    content: toPrismaBytes(avatar.content),
  };
}

/**
 * Prisma User Repository Implementation
 * Implements UserRepository using Prisma ORM
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(username: string, email: string, password: string, avatar: Media | null = null): Promise<User> {
    const data: Prisma.UserCreateInput = {
      username,
      authentication: { create: { email, password } },
      ...(avatar ? { avatar: { create: toAvatarMediaCreateInput(avatar) } } : {}),
    };

    const user = await this.prisma.user.create({
      data,
      include: USER_PROFILE_INCLUDE,
    });

    return toDomainUser(user);
  }

  private async findRawById(
    id: UserId,
  ): Promise<Prisma.UserGetPayload<{ include: typeof USER_PROFILE_INCLUDE }> | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: USER_PROFILE_INCLUDE,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { authentication: { email }, deletedAt: null },
      include: USER_PROFILE_INCLUDE,
    });

    if (!user) return null;

    return toDomainUser(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.findRawById(id);

    if (!user) return null;

    return toDomainUser(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
      include: USER_PROFILE_INCLUDE,
    });

    if (!user) return null;

    return toDomainUser(user);
  }

  async exists(email: string, username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ authentication: { email } }, { username }],
      },
    });

    return user !== null;
  }

  async updateProfile(
    id: UserId,
    updates: {
      username?: string;
      email?: string;
      avatar?: Media | null;
    },
  ): Promise<User> {
    const existingUser = await this.findRawById(id);
    if (!existingUser) {
      throw createDomainError(USER_PROFILE_UPDATE_USER_NOT_FOUND_ERROR, { userId: id });
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof updates.username !== 'undefined') {
      data.username = updates.username;
    }

    if (typeof updates.email !== 'undefined') {
      data.authentication = {
        update: {
          email: updates.email,
          ...(updates.email !== existingUser.authentication?.email
            ? {
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
                resetRequestLocale: null,
                resetRequestedAt: null,
                resetAvailableAt: null,
              }
            : {}),
        },
      };
    }

    if (updates.avatar !== undefined) {
      if (updates.avatar === null) {
        data.avatar = existingUser.avatar ? { delete: true } : undefined;
      } else if (existingUser.avatar) {
        data.avatar = {
          update: {
            mimeType: updates.avatar.mimeType,
            content: toPrismaBytes(updates.avatar.content),
          },
        };
      } else {
        data.avatar = {
          create: toAvatarMediaCreateInput(updates.avatar),
        };
      }
    }

    const user = await this.prisma.user.update({
      where: { id, deletedAt: null },
      data,
      include: USER_PROFILE_INCLUDE,
    });

    return toDomainUser(user);
  }
}
