import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit/question.fixture';
import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories/question-repository.mock-factory';
import { DeleteQuestionUseCase } from './delete-question-use-case';

describe('DeleteQuestionUseCase', () => {
  it('should delete existing question', async () => {
    const question = createQuestionFixture();
    const questionRepository = createQuestionRepositoryMock({ findById: question });
    const useCase = new DeleteQuestionUseCase(questionRepository as never);

    await useCase.execute(question.id);

    expect(questionRepository.delete).toHaveBeenCalledWith(question.id);
  });

  it('should throw when question is missing', async () => {
    const questionRepository = createQuestionRepositoryMock({ findById: null });
    const useCase = new DeleteQuestionUseCase(questionRepository as never);

    await expect(useCase.execute(99)).rejects.toThrow(QuizErrorCode.QUESTION_NOT_FOUND);
  });
});
