import { inject, injectable } from 'inversify';
import type { UpdateQuizQuestionInput } from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface UpdateQuizQuestionCommand {
  readonly questionId: number;
  readonly input: UpdateQuizQuestionInput;
}

@injectable()
export class UpdateQuizQuestionUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: UpdateQuizQuestionCommand): Promise<QuizQuestion> {
    return this.quizRepository.updateQuizQuestion(command.questionId, command.input);
  }
}
