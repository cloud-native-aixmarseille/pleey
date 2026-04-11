import { Inject, Injectable } from '@nestjs/common';
import {
  type QuizQuestion,
  type QuizQuestionId,
  QuizQuestionType,
} from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { QuizQuestionRepository } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { QuizQuestionRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { SelectableOptionInput } from '../../../../../domain/game/types/shared/entities/selectable-option';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface UpdateQuizQuestionCommand {
  readonly questionId: QuizQuestionId;
  readonly position?: number;
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly timeLimit: number;
  readonly points: number;
  readonly answers: readonly SelectableOptionInput[];
}

@Injectable()
export class UpdateQuizQuestionUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    @Inject(QuizQuestionRepositoryProvider)
    private readonly questionRepository: QuizQuestionRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly optionPolicy: SelectableOptionPolicy,
  ) {}

  async execute(command: UpdateQuizQuestionCommand, userId: UserId): Promise<QuizQuestion> {
    const question = await this.questionRepository.findById(command.questionId);
    if (!question) {
      throw new Error(QuizErrorCode.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);
    const answers = this.optionPolicy.normalize(command.answers);
    this.assertAnswers(command.type, answers);

    return this.questionRepository.update(command.questionId, {
      position: command.position,
      questionText: command.questionText,
      type: command.type,
      timeLimit: command.timeLimit,
      points: command.points,
      answers,
    });
  }

  private assertAnswers(
    type: QuizQuestionType,
    answers: ReturnType<SelectableOptionPolicy['normalize']>,
  ): void {
    const errorCodes = {
      invalidCorrectOption: QuizErrorCode.INVALID_CORRECT_ANSWER,
      emptyOptionText: QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY,
    };

    if (type === QuizQuestionType.TrueFalse) {
      this.optionPolicy.assertTrueFalseOptions(answers, errorCodes);
      return;
    }

    this.optionPolicy.assertMultipleChoiceOptions(answers, errorCodes);
  }
}
