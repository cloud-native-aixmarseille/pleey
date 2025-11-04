import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetQuestionsUseCase } from '../get-questions.use-case';
import { IQuizRepository } from '../../../domains/quiz/ports/quiz.repository.interface';
import { Question } from '../../../shared/types';

describe('GetQuestionsUseCase', () => {
  let getQuestionsUseCase: GetQuestionsUseCase;
  let mockQuizRepository: IQuizRepository;

  const mockQuestions: Question[] = [
    {
      id: 1,
      quiz_id: 1,
      question_text: 'What is 2+2?',
      type: 'multiple_choice',
      correct_answer: 'A',
      option_a: '4',
      option_b: '3',
      option_c: '5',
      option_d: '6',
      time_limit: 20,
      points: 100,
    },
  ];

  beforeEach(() => {
    mockQuizRepository = {
      getQuizzes: vi.fn(),
      getQuestions: vi.fn(),
      createQuiz: vi.fn(),
      addQuestion: vi.fn(),
    };

    getQuestionsUseCase = new GetQuestionsUseCase(mockQuizRepository);
  });

  it('should get questions for a quiz', async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockResolvedValue(mockQuestions);

    const result = await getQuestionsUseCase.execute({
      token: 'test-token',
      quizId: 1,
    });

    expect(result).toEqual(mockQuestions);
    expect(mockQuizRepository.getQuestions).toHaveBeenCalledWith('test-token', 1);
  });

  it('should throw error when repository fails', async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockRejectedValue(
      new Error('Quiz not found')
    );

    await expect(
      getQuestionsUseCase.execute({ token: 'test-token', quizId: 999 })
    ).rejects.toThrow('Quiz not found');
  });

  it('should return empty array when quiz has no questions', async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockResolvedValue([]);

    const result = await getQuestionsUseCase.execute({
      token: 'test-token',
      quizId: 1,
    });

    expect(result).toEqual([]);
  });
});
