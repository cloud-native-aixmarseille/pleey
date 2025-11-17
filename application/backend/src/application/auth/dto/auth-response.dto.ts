/**
 * Auth Response DTO
 * Response returned after successful authentication
 */
export class AuthResponseDto {
  token: string;
  /** @deprecated Use accessToken instead */
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}
