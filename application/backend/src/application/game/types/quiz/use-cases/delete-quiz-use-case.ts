import { Inject, Injectable } from '@nestjs/common';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(quizId: GameTypeId, userId: UserId): Promise<boolean> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);

    if (await this.quizRepository.hasActiveParty(quiz.gameId)) {
      throw new Error(QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY);
    }

    await this.quizRepository.delete(quiz.id);

    return true;
  }
}
