/**
 * Auth Response DTO
 * Response returned after successful authentication
 */
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { AuthToken } from '../../../domain/auth/types/auth-token';

export class AuthResponseDto {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  expiresIn: number;
  user: {
    id: UserId;
    username: string;
    email: string;
    isAdmin: boolean;
    avatarUri: string | null;
  };
}
