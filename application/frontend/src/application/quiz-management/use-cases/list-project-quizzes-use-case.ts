import { inject, injectable } from 'inversify';
import type { Quiz } from '../../../domains/quiz/entities/quiz';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface ListProjectQuizzesCommand {
  readonly projectId: number;
}

@injectable()
export class ListProjectQuizzesUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: ListProjectQuizzesCommand): Promise<Quiz[]> {
    return this.quizRepository.getQuizzesByProject(command.projectId);
  }
}
