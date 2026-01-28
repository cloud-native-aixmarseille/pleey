import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import {
  type GamePauseHandlerRegistry,
  GamePauseHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-pause-handler.registry';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

@Injectable()
export class PauseGameUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    @Inject(GamePauseHandlerRegistryProvider)
    private readonly pauseHandlerRegistry: GamePauseHandlerRegistry,
  ) {
    super(hostStageControlContextService);
  }

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const { state, session, game } = await this.loadAuthorizedHostGameContext(pin, hostId);

    const handler = this.pauseHandlerRegistry.resolve(game.type);
    await handler.pause({ pin, state, session, hostId });
  }
}
