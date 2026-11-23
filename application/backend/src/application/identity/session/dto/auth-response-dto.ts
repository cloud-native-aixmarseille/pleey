/**
 * Auth Response DTO
 * Response returned after successful authentication
 */

import type { AuthToken } from '@pleey/domain/identity';
import type { UserId } from '../../../../domain/identity/entities/user';

export class AuthResponseDto {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  expiresIn: number;
  user: {
    id: UserId;
    username: string;
    email: string;
    avatarUri: string | null;
  };
}
