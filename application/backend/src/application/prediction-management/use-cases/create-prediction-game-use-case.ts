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
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import type { CreatePredictionGameDto } from '../dto/create-prediction-game-dto';

/**
 * Create Prediction Game Use Case
 * Handles prediction game creation logic
 */
@Injectable()
export class CreatePredictionGameUseCase {
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
    dto: CreatePredictionGameDto,
    userId: UserId,
  ): Promise<{ game: Game; prediction: Prediction }> {
    const project = await this.projectRepository.findById(dto.projectId);
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

    if (!membership.canCreateGames()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const game = await this.gameRepository.create(
      GameType.PREDICTION,
      dto.title,
      dto.description || null,
      dto.projectId,
    );

    const prediction = await this.predictionRepository.create(game.id);
    return { game, prediction };
  }
}
