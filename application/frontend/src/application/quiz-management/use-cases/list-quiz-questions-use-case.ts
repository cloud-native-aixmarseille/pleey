import { inject, injectable } from 'inversify';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface ListQuizQuestionsCommand {
  readonly quizId: number;
}

@injectable()
export class ListQuizQuestionsUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: ListQuizQuestionsCommand): Promise<QuizQuestion[]> {
    return this.quizRepository.getQuizQuestions(command.quizId);
  }
}
