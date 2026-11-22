import { Buffer } from 'node:buffer';
import type { Prisma } from '@prisma/client';
import { User, type UserId } from '../../../domain/identity/entities/user';
import { Media, type MediaId } from '../../../domain/media/entities/media';

export const USER_PROFILE_INCLUDE = {
  avatar: true,
} satisfies Prisma.UserInclude;

export function toDomainUser(user: Prisma.UserGetPayload<{ include: typeof USER_PROFILE_INCLUDE }>): User {
  const media = user.avatar;
  return new User(
    user.id as UserId,
    user.username,
    user.email,
    media
      ? new Media(media.id as MediaId, media.mimeType, Buffer.from(media.content), media.createdAt, media.updatedAt)
      : null,
    user.createdAt,
  );
}
