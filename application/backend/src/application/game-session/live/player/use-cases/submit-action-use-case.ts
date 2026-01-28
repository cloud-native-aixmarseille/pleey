import { Inject, Injectable } from '@nestjs/common';
import {
  type GameSubmitActionHandlerRegistry,
  GameSubmitActionHandlerRegistryProvider,
  type GameSubmitActionHandlerResult,
} from '../../../../../domain/game/ports/handlers/game-submit-action-handler.registry';
import { GameSessionPinContextService } from '../../shared/services/game-session-pin-context-service';
import type { SubmitGameActionDto } from '../dto/submit-game-action-dto';

@Injectable()
export class SubmitActionUseCase {
  constructor(
    private readonly gameSessionPinContextService: GameSessionPinContextService,
    @Inject(GameSubmitActionHandlerRegistryProvider)
    private readonly submitActionHandlerRegistry: GameSubmitActionHandlerRegistry,
  ) {}

  async execute(
    dto: SubmitGameActionDto,
    connectionId?: string,
  ): Promise<GameSubmitActionHandlerResult> {
    const { state, session, game } = await this.gameSessionPinContextService.load(dto.pin);

    const handler = this.submitActionHandlerRegistry.resolve(game.type);
    return handler.submit({ pin: dto.pin, state, session, gameType: game.type, dto, connectionId });
  }
}
