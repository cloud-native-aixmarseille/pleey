import { createHash } from 'node:crypto';
import type { User } from '../../../domain/auth/entities/user.entity';

export function buildUserAvatarUrl(userId: number, version?: string | null): string {
  const suffix = version ? `?v=${version}` : '';
  return `/api/avatars/users/${userId}${suffix}`;
}

export function buildSessionPlayerAvatarUrl(sessionId: number, seed: string): string {
  const encodedSeed = encodeURIComponent(seed);
  return `/api/avatars/sessions/${sessionId}/${encodedSeed}`;
}

export function computeAvatarVersion(avatarDataUri?: string | null): string | null {
  const payload = avatarDataUri?.trim();
  if (!payload) {
    return null;
  }

  const hash = createHash('sha1').update(payload).digest('hex');
  return hash.slice(0, 12);
}

export function toPublicAvatarUrl(user: User): string | null {
  if (!user.avatarUrl) {
    return null;
  }

  const version = computeAvatarVersion(user.avatarUrl);
  return buildUserAvatarUrl(user.id, version);
}

export function mapUserToPublicProfile(user: User): Omit<User, 'password'> {
  const safeUser = user.toSafeObject();
  return {
    ...safeUser,
    avatarUrl: toPublicAvatarUrl(user),
  } as Omit<User, 'password'>;
}
