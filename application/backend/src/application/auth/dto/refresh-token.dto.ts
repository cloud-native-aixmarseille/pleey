import { IsNotEmpty, IsString } from 'class-validator';
import type { AuthToken } from '../../../domain/auth/types/auth-token';

/**
 * Refresh Token DTO
 * Carries the refresh token string for renewing sessions.
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: AuthToken;
}
