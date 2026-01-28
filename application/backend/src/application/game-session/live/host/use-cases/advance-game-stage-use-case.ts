import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import {
  type GameNextStageHandlerRegistry,
  GameNextStageHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-next-stage-handler.registry';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

@Injectable()
export class AdvanceGameStageUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    @Inject(GameNextStageHandlerRegistryProvider)
    private readonly nextStageHandlerRegistry: GameNextStageHandlerRegistry,
  ) {
    super(hostStageControlContextService);
  }

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const { state, session, game } = await this.loadAuthorizedHostGameContext(pin, hostId);

    const handler = this.nextStageHandlerRegistry.resolve(game.type);
    await handler.nextStage({ pin, state, session });
  }
}
