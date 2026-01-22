import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSession } from '../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import {
  type OrganizationMemberRepository,
  OrganizationMemberRepositoryProvider,
} from '../../../domain/organization/ports/organization-member.repository';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import {
  type QuizRepository,
  QuizRepositoryProvider,
} from '../../../domain/quiz/ports/quiz.repository';

/**
 * Get Quiz Sessions Use Case
 * Retrieves all sessions for a quiz after validating permissions
 */
@Injectable()
export class GetQuizSessionsUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(quizId: QuizId, requesterId: UserId): Promise<GameSession[]> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(GameErrorCode.QUIZ_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      quiz.organizationId,
      requesterId,
    );

    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.gameSessionRepository.findByQuizId(quizId);
  }
}
