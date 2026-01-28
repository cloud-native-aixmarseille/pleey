import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import {
  type GameJoinHandlerRegistry,
  GameJoinHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-join-handler.registry';
import { GameSessionStateService } from '../../../../../domain/game/services/game-session-state-service';
import { GameSessionPinContextService } from '../../shared/services/game-session-pin-context-service';
import type { JoinGameDto } from '../dto/join-game-dto';

@Injectable()
export class JoinGameUseCase {
  constructor(
    private readonly gameSessionPinContextService: GameSessionPinContextService,
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameJoinHandlerRegistryProvider)
    private readonly joinHandlerRegistry: GameJoinHandlerRegistry,
  ) {}

  async execute(connectionId: string, dto: JoinGameDto): Promise<void> {
    if (dto.userId !== undefined) {
      const currentPin = await this.gameSessionStateService.findPinByUserId(dto.userId);

      if (currentPin && currentPin !== dto.pin) {
        throw new Error(GameErrorCode.ACTIVE_SESSION_EXISTS);
      }
    }

    const { state, session, game } = await this.gameSessionPinContextService.load(dto.pin);

    const handler = this.joinHandlerRegistry.resolve(game.type);
    await handler.join({
      connectionId,
      dto,
      pin: dto.pin,
      state,
      session,
    });

    if (dto.userId !== undefined) {
      await this.gameSessionStateService.savePinByUserId(dto.userId, dto.pin);
    }
  }
}
