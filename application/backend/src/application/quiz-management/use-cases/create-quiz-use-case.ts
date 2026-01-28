import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../domain/game/ports/repositories/game.repository';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import {
  type ProjectRepository,
  ProjectRepositoryProvider,
} from '../../../domain/project/ports/project.repository';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import type { CreateQuizDto } from '../dto/create-quiz-dto';

/**
 * Create Quiz Use Case
 * Handles quiz creation logic
 */
@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(dto: CreateQuizDto, userId: UserId): Promise<Quiz> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new Error(ProjectErrorCode.PROJECT_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      userId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    // Check if member can create quizzes
    if (!membership.canCreateGames()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const game = await this.gameRepository.create(
      GameType.QUIZ,
      dto.title,
      dto.description || null,
      dto.projectId,
    );

    return this.quizRepository.create(game.id);
  }
}
