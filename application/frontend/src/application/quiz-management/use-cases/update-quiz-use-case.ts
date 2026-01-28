import { inject, injectable } from 'inversify';
import type { Quiz } from '../../../domains/quiz/entities/quiz';
import type { UpdateQuizInput } from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

interface UpdateQuizCommand {
  readonly quizId: number;
  readonly input: UpdateQuizInput;
}

@injectable()
export class UpdateQuizUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: UpdateQuizCommand): Promise<Quiz> {
    return this.quizRepository.updateQuiz(command.quizId, command.input);
  }
}
