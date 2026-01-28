import { inject, injectable } from 'inversify';
import type { CreateQuizQuestionInput } from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { QUIZ_SERVICE_ID } from '../contracts/quiz-service-id';

@injectable()
export class CreateQuizQuestionUseCase {
  constructor(
    @inject(QUIZ_SERVICE_ID.quizRepository)
    private readonly quizRepository: QuizRepository,
  ) {}

  execute(command: CreateQuizQuestionInput): Promise<QuizQuestion> {
    return this.quizRepository.createQuizQuestion(command);
  }
}
