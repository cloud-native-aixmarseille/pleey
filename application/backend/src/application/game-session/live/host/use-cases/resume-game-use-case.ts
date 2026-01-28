import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import {
  type GameResumeHandlerRegistry,
  GameResumeHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-resume-handler.registry';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

@Injectable()
export class ResumeGameUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    @Inject(GameResumeHandlerRegistryProvider)
    private readonly resumeHandlerRegistry: GameResumeHandlerRegistry,
  ) {
    super(hostStageControlContextService);
  }

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const { state, session, game } = await this.loadAuthorizedHostGameContext(pin, hostId);

    const handler = this.resumeHandlerRegistry.resolve(game.type);
    await handler.resume({ pin, state, session, hostId });
  }
}
