import type { ProjectId } from '../../project/entities/project';
import { GameType } from '../enums/game-type.enum';

export type GameId = number;

/**
 * Game Domain Entity
 * Represents a game definition independent of implementation
 */
export class Game {
  constructor(
    public readonly id: GameId,
    public readonly type: GameType,
    public readonly title: string,
    public readonly description: string | null,
    public readonly projectId: ProjectId,
    public readonly createdAt: Date,
  ) {}

  hasValidTitle(): boolean {
    return this.title.trim().length > 0;
  }

  belongsToProject(projectId: ProjectId): boolean {
    return this.projectId === projectId;
  }
}
