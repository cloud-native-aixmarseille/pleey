import { Inject, Injectable } from '@nestjs/common';
import type { Quiz } from '../../../../../domain/game/types/quiz/entities/quiz';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface UpdateQuizCommand {
  readonly quizId: GameTypeId;
  readonly title: string;
  readonly description: string | null;
}

@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(command: UpdateQuizCommand, userId: UserId): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(command.quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);

    return this.quizRepository.update(quiz.id, {
      title: command.title,
      description: command.description,
    });
  }
}
