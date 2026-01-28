import { Game, type GameId } from '../../../domain/game/entities/game';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import type { ProjectId } from '../../../domain/project/entities/project';

export type GameFixtureParams = {
  id?: GameId;
  type?: GameType;
  title?: string;
  description?: string | null;
  projectId?: ProjectId;
  createdAt?: Date;
};

export const createGameFixture = (params: GameFixtureParams = {}): Game => {
  return new Game(
    params.id ?? 1,
    params.type ?? GameType.QUIZ,
    params.title ?? 'Arcade Trivia',
    params.description ?? null,
    params.projectId ?? 1,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
