import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  GameSessionRepositoryProvider,
  type GameSessionRepository,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  QuizRepositoryProvider,
  type QuizRepository,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
import {
  OrganizationMemberRepositoryProvider,
  type OrganizationMemberRepository,
} from '../../../domain/organization/repositories/organization-member.repository.interface';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';

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
  ) { }

  async execute(quizId: number, requesterId: number): Promise<GameSession[]> {
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
