export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string | null;
}
