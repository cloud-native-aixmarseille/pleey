import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import {
  type GameStartHandlerRegistry,
  GameStartHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-start-handler.registry';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

@Injectable()
export class StartGameUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    @Inject(GameStartHandlerRegistryProvider)
    private readonly startHandlerRegistry: GameStartHandlerRegistry,
  ) {
    super(hostStageControlContextService);
  }

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const { state, session, game } = await this.loadAuthorizedHostGameContext(pin, hostId);

    const handler = this.startHandlerRegistry.resolve(game.type);
    await handler.start({ pin, state, session });
  }
}
