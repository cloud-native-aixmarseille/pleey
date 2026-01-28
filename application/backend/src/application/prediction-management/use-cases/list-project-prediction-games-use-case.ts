import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user';
import type { Game } from '../../../domain/game/entities/game';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import type { GameRepository } from '../../../domain/game/ports/repositories/game.repository';
import { GameRepositoryProvider } from '../../../domain/game/ports/repositories/game.repository';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import type { Prediction } from '../../../domain/prediction/entities/prediction';
import type { PredictionRepository } from '../../../domain/prediction/ports/prediction.repository';
import { PredictionRepositoryProvider } from '../../../domain/prediction/ports/prediction.repository';
import type { ProjectId } from '../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';

/**
 * Get Prediction Games Use Case
 * Retrieves prediction games for an organization
 */
@Injectable()
export class ListProjectPredictionGamesUseCase {
  constructor(
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(PredictionRepositoryProvider)
    private readonly predictionRepository: PredictionRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    projectId: ProjectId,
    userId: UserId,
  ): Promise<Array<{ game: Game; prediction: Prediction }>> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      userId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const games = await this.gameRepository.findByProject(projectId);
    const predictionGames = games.filter((game) => game.type === GameType.PREDICTION);

    const results = await Promise.all(
      predictionGames.map(async (game) => {
        const prediction = await this.predictionRepository.findByGameId(game.id);
        if (!prediction) {
          return null;
        }

        return { game, prediction };
      }),
    );

    return results.filter((result): result is { game: Game; prediction: Prediction } =>
      Boolean(result),
    );
  }
}
