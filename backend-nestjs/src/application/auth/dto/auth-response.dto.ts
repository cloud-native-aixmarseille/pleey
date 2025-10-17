/**
 * Auth Response DTO
 * Response returned after successful authentication
 */
export class AuthResponseDto {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}
