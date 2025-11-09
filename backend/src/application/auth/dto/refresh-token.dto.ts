import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Refresh Token DTO
 * Carries the refresh token string for renewing sessions.
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
