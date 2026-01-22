import type { Request } from 'express';
import type { UserId } from '../../domain/auth/entities/user.entity';
import type { AvatarUri } from '../../domain/auth/types/avatar-uri';

export interface AuthenticatedRequest extends Request {
  user: {
    id: UserId;
    username: string;
    isAdmin: boolean;
    avatarUri: AvatarUri | null;
  };
}
