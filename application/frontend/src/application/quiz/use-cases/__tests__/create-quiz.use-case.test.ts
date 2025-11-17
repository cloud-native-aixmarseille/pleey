import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateQuizUseCase } from '../create-quiz.use-case';
import { IQuizRepository } from '../../../domains/quiz/ports/quiz.repository.interface';
import { Quiz } from '../../../shared/types';

describe('CreateQuizUseCase', () => {
  let createQuizUseCase: CreateQuizUseCase;
  let mockQuizRepository: IQuizRepository;

  beforeEach(() => {
    mockQuizRepository = {
      getQuizzes: vi.fn(),
      getQuestions: vi.fn(),
      createQuiz: vi.fn(),
      addQuestion: vi.fn(),
    };

    createQuizUseCase = new CreateQuizUseCase(mockQuizRepository);
  });

  it('should create quiz successfully', async () => {
    const mockQuiz: Quiz = {
      id: 1,
      title: 'Test Quiz',
      description: 'Test Description',
      created_by: 1,
      created_at: new Date().toISOString(),
    };

    vi.mocked(mockQuizRepository.createQuiz).mockResolvedValue(mockQuiz);

    const result = await createQuizUseCase.execute({
      token: 'test-token',
      title: 'Test Quiz',
      description: 'Test Description',
    });

    expect(result).toEqual(mockQuiz);
    expect(mockQuizRepository.createQuiz).toHaveBeenCalledWith(
      'test-token',
      'Test Quiz',
      'Test Description'
    );
  });

  it('should throw error when title is empty', async () => {
    await expect(
      createQuizUseCase.execute({
        token: 'test-token',
        title: '',
        description: 'Test Description',
      })
    ).rejects.toThrow('Quiz title is required');

    expect(mockQuizRepository.createQuiz).not.toHaveBeenCalled();
  });

  it('should throw error when title is only whitespace', async () => {
    await expect(
      createQuizUseCase.execute({
        token: 'test-token',
        title: '   ',
        description: 'Test Description',
      })
    ).rejects.toThrow('Quiz title is required');

    expect(mockQuizRepository.createQuiz).not.toHaveBeenCalled();
  });
});
