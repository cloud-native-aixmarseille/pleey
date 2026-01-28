import { inject, injectable } from 'inversify';
import type { Quiz } from '../../../domains/quiz/entities/quiz';
import type {
  CreateQuizQuestionInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizQuestion } from '../../../domains/quiz/entities/quiz-question';
import { CreateQuizQuestionUseCase } from '../use-cases/create-quiz-question-use-case';
import { DeleteQuizQuestionUseCase } from '../use-cases/delete-quiz-question-use-case';
import { LoadQuizManagementDataUseCase } from '../use-cases/load-quiz-management-data-use-case';
import { UpdateQuizQuestionUseCase } from '../use-cases/update-quiz-question-use-case';
import { UpdateQuizUseCase } from '../use-cases/update-quiz-use-case';

@injectable()
export class QuizManagementFacade {
  constructor(
    @inject(LoadQuizManagementDataUseCase)
    private readonly loadQuizManagementDataUseCase: LoadQuizManagementDataUseCase,
    @inject(UpdateQuizUseCase)
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    @inject(CreateQuizQuestionUseCase)
    private readonly createQuizQuestionUseCase: CreateQuizQuestionUseCase,
    @inject(UpdateQuizQuestionUseCase)
    private readonly updateQuizQuestionUseCase: UpdateQuizQuestionUseCase,
    @inject(DeleteQuizQuestionUseCase)
    private readonly deleteQuizQuestionUseCase: DeleteQuizQuestionUseCase,
  ) {}

  loadManagementData(quizId: number) {
    return this.loadQuizManagementDataUseCase.execute({ quizId });
  }

  updateQuiz(quizId: number, input: UpdateQuizInput): Promise<Quiz> {
    return this.updateQuizUseCase.execute({ quizId, input });
  }

  createQuestion(input: CreateQuizQuestionInput): Promise<QuizQuestion> {
    return this.createQuizQuestionUseCase.execute(input);
  }

  updateQuestion(questionId: number, input: UpdateQuizQuestionInput): Promise<QuizQuestion> {
    return this.updateQuizQuestionUseCase.execute({ questionId, input });
  }

  deleteQuestion(questionId: number): Promise<void> {
    return this.deleteQuizQuestionUseCase.execute({ questionId });
  }
}
