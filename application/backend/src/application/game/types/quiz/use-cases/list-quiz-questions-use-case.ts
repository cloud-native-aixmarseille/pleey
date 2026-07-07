import { Inject, Injectable } from '@nestjs/common';
import type { QuizQuestion } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuizNotFoundError } from '../../../../../domain/game/types/quiz/errors';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { QuizQuestionRepository } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { QuizQuestionRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class ListQuizQuestionsUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    @Inject(QuizQuestionRepositoryProvider)
    private readonly questionRepository: QuizQuestionRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(quizId: GameTypeId, userId: UserId): Promise<QuizQuestion[]> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new QuizNotFoundError({ quizId });
    }

    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);

    return this.questionRepository.findByQuizId(quiz.id);
  }
}
