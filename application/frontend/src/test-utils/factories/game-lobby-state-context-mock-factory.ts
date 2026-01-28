import { GetGameLobbyStateUseCase } from '../../application/game-session/live/player/use-cases/get-game-lobby-state-use-case';
import { LobbyService } from '../../domains/game-session/services/lobby-service';
import type { GameLobbyStatePort } from '../../presentation/game-session/live/shared/contexts/game-lobby-state-context';

export class GameLobbyStateContextMockFactory {
  createValue(overrides: Partial<GameLobbyStatePort> = {}): GameLobbyStatePort {
    const useCase = new GetGameLobbyStateUseCase(new LobbyService());

    return {
      execute: useCase.execute.bind(useCase),
      ...overrides,
    };
  }

  createModule(overrides: Partial<GameLobbyStatePort> = {}) {
    const value = this.createValue(overrides);

    return {
      useGameLobbyState: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: Partial<GameLobbyStatePort> = {},
  ): Promise<TModule & ReturnType<GameLobbyStateContextMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }
}
