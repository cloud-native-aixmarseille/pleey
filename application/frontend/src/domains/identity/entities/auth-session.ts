import type { User } from './user';

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly user: User;
}
