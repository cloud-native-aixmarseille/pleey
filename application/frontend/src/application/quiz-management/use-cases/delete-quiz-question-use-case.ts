import { inject, injectable } from 'inversify';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface DeleteQuizQuestionCommand {
  readonly questionId: number;
}

@injectable()
export class DeleteQuizQuestionUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: DeleteQuizQuestionCommand): Promise<void> {
    return this.quizRepository.deleteQuizQuestion(command.questionId);
  }
}
