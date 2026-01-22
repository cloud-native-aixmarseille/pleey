import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { UserAvatarService } from '../../../domain/auth/services/user-avatar.service';
import type { GameSessionId } from '../../../domain/game/entities/game-session';

@Injectable()
export class GetSessionAvatarUseCase {
  constructor(private readonly userAvatarService: UserAvatarService) {}

  execute(sessionId: GameSessionId, encodedSeed: string): Buffer {
    let seed: string;

    try {
      seed = decodeURIComponent(encodedSeed);
    } catch (error) {
      throw new NotFoundException(AuthErrorCode.AVATAR_NOT_FOUND, {
        cause: error as Error,
      });
    }

    return this.userAvatarService.generateAvatar(seed, sessionId);
  }
}
