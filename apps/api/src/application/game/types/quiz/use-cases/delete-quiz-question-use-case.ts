import { Inject, Injectable } from '@nestjs/common';
import type { QuizQuestionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuestionNotFoundError, QuizNotFoundError } from '../../../../../domain/game/types/quiz/errors';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { QuizQuestionRepository } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { QuizQuestionRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class DeleteQuizQuestionUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    @Inject(QuizQuestionRepositoryProvider)
    private readonly questionRepository: QuizQuestionRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(questionId: QuizQuestionId, userId: UserId): Promise<boolean> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new QuestionNotFoundError({ questionId });
    }

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) {
      throw new QuizNotFoundError({ questionId, quizId: question.quizId });
    }

    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);
    await this.questionRepository.delete(questionId);

    return true;
  }
}
