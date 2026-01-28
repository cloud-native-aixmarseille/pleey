import { inject, injectable } from 'inversify';
import type { Quiz } from '../../../domains/quiz/entities/quiz';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface GetQuizByIdCommand {
  readonly quizId: number;
}

@injectable()
export class GetQuizByIdUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: GetQuizByIdCommand): Promise<Quiz | null> {
    return this.quizRepository.getQuizById(command.quizId);
  }
}
