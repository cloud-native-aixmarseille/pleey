import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameId } from '../../../../domain/game/entities/game';
import type { GameSession } from '../../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import {
  type OrganizationMemberRepository,
  OrganizationMemberRepositoryProvider,
} from '../../../../domain/organization/ports/organization-member.repository';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';

@Injectable()
export class ListGameHostSessionsUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(gameId: GameId, requesterId: UserId): Promise<GameSession[]> {
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const project = await this.projectRepository.findById(game.projectId);
    if (!project) {
      throw new Error(ProjectErrorCode.PROJECT_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      requesterId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.gameSessionRepository.findByGameId(gameId);
  }
}
