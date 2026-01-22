import { createHash } from 'node:crypto';
import type { User, UserId } from '../../../domain/auth/entities/user.entity';
import type { AvatarUri } from '../../../domain/auth/types/avatar-uri';
import type { GameSessionId } from '../../../domain/game/entities/game-session';

export function buildUserAvatarUri(userId: UserId, version?: string | null): string {
  const suffix = version ? `?v=${version}` : '';
  return `/api/avatars/users/${userId}${suffix}`;
}

export function buildSessionPlayerAvatarUri(sessionId: GameSessionId, seed: string): string {
  const encodedSeed = encodeURIComponent(seed);
  return `/api/avatars/sessions/${sessionId}/${encodedSeed}`;
}

export function computeAvatarVersion(avatarDataUri?: AvatarUri | null): string | null {
  if (!avatarDataUri) {
    return null;
  }

  const payload = avatarDataUri.toString('utf8').trim();
  if (!payload) {
    return null;
  }

  const hash = createHash('sha1').update(payload).digest('hex');
  return hash.slice(0, 12);
}

export function mapUserToPublicProfile(user: User): Omit<
  User,
  'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'
> & {
  avatarUri: string | null;
} {
  const safeUser = user.toSafeObject();
  return {
    ...safeUser,
    avatarUri: user.avatarUri ? user.avatarUri.toString('utf8') : null,
  } as Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'> & {
    avatarUri: string | null;
  };
}
