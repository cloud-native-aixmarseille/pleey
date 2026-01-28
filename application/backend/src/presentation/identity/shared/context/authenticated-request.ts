import type { Request } from 'express';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { Media } from '../../../../domain/media/entities/media';

export interface AuthenticatedRequest extends Request {
  user: {
    id: UserId;
    username: string;
    avatar: Media | null;
  };
}
