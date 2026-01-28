import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { UserId } from '../../../domain/auth/entities/user';
import { User } from '../../../domain/auth/entities/user';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { Media, type MediaId } from '../../../domain/media/entities/media';
import { PrismaService } from '../../database/prisma-service';

type PrismaMediaRecord = {
  id: MediaId;
  mimeType: string;
  content: Uint8Array;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaUserRecord = {
  id: UserId;
  username: string;
  email: string;
  password: string;
  avatar: PrismaMediaRecord | null;
  refreshTokenHash: string | null;
  refreshTokenExpiresAt: Date | null;
  createdAt: Date;
};

const USER_MEDIA_INCLUDE = {
  avatar: true,
} satisfies Prisma.UserInclude;

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

function toDomainMedia(media: PrismaMediaRecord | null): Media | null {
  if (!media) {
    return null;
  }

  return new Media(
    media.id,
    media.mimeType,
    Buffer.from(media.content),
    media.createdAt,
    media.updatedAt,
  );
}

function toDomainUser(user: PrismaUserRecord): User {
  return new User(
    user.id,
    user.username,
    user.email,
    user.password,
    toDomainMedia(user.avatar),
    user.createdAt,
    user.refreshTokenHash ?? null,
    user.refreshTokenExpiresAt ?? null,
  );
}

/**
 * Prisma User Repository Implementation
 * Implements UserRepository using Prisma ORM
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    username: string,
    email: string,
    password: string,
    avatar: Media | null = null,
  ): Promise<User> {
    const data: Prisma.UserCreateInput = {
      username,
      email,
      password,
      ...(avatar ? { avatar: { create: toAvatarMediaCreateInput(avatar) } } : {}),
    };

    const user = (await this.prisma.user.create({
      data,
      include: USER_MEDIA_INCLUDE,
    })) as PrismaUserRecord;

    return toDomainUser(user);
  }

  private async findRawById(id: UserId): Promise<PrismaUserRecord | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      include: USER_MEDIA_INCLUDE,
    })) as PrismaUserRecord | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
      include: USER_MEDIA_INCLUDE,
    })) as PrismaUserRecord | null;

    if (!user) return null;

    return toDomainUser(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.findRawById(id);

    if (!user) return null;

    return toDomainUser(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { username },
      include: USER_MEDIA_INCLUDE,
    })) as PrismaUserRecord | null;

    if (!user) return null;

    return toDomainUser(user);
  }

  async exists(email: string, username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
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
      throw new Error(`User ${id} not found`);
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof updates.username !== 'undefined') {
      data.username = updates.username;
    }

    if (typeof updates.email !== 'undefined') {
      data.email = updates.email;
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

    const user = (await this.prisma.user.update({
      where: { id },
      data,
      include: USER_MEDIA_INCLUDE,
    })) as PrismaUserRecord;

    return toDomainUser(user);
  }

  async updateRefreshToken(
    id: UserId,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        refreshTokenHash,
        refreshTokenExpiresAt,
      },
    });
  }

  async clearRefreshToken(id: UserId): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  }
}
