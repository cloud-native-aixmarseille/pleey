import { describe, expect, it, vi } from 'vitest';
import { Quiz } from '../../../../../domain/game/types/quiz/entities/quiz';
import { QuizQuestionType } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import type { QuizImportQuestionMapper } from '../services/quiz-import-question-mapper';
import { CreateQuizFromImportUseCase } from './create-quiz-from-import-use-case';

class TestPlayableContentImportSource extends PlayableContentImportSource {
  constructor(readonly fileName: string) {
    super();
  }

  async readAll(): Promise<string> {
    return 'unused';
  }

  async *readLines(): AsyncIterable<string> {
    yield* [];
  }
}

describe('CreateQuizFromImportUseCase', () => {
  it('creates a quiz and imported questions through one repository command', async () => {
    const createdQuiz = new Quiz(
      backendTestIdentifiers.game(9),
      backendTestIdentifiers.game(21),
      backendTestIdentifiers.project(4),
      'Sprint quiz',
      null,
      new Date('2026-06-01T10:00:00.000Z'),
      1,
    );
    const quizRepository = {
      createWithQuestions: vi.fn().mockResolvedValue(createdQuiz),
    } as unknown as QuizManagementRepository;
    const accessGuard = {
      assertCanManageProject: vi.fn().mockResolvedValue(undefined),
    };
    const importQuestionMapper = {
      map: vi.fn().mockResolvedValue([
        {
          answers: [
            { id: null, isCorrect: true, position: 0, text: 'Blue' },
            { id: null, isCorrect: false, position: 1, text: 'Green' },
          ],
          points: 1000,
          questionText: 'What color is the sky?',
          timeLimit: 20,
          type: QuizQuestionType.Multiple,
        },
      ]),
    } as unknown as QuizImportQuestionMapper;
    const useCase = new CreateQuizFromImportUseCase(
      quizRepository,
      accessGuard as never,
      importQuestionMapper,
    );
    const source = new TestPlayableContentImportSource('quiz-import.json');

    const quiz = await useCase.execute(
      {
        projectId: backendTestIdentifiers.project(4),
        title: 'Sprint quiz',
        description: null,
        source,
      },
      backendTestIdentifiers.user(12),
    );

    expect(accessGuard.assertCanManageProject).toHaveBeenCalledWith(
      backendTestIdentifiers.project(4),
      backendTestIdentifiers.user(12),
    );
    expect(importQuestionMapper.map).toHaveBeenCalledWith(source);
    expect(quizRepository.createWithQuestions).toHaveBeenCalledWith({
      projectId: backendTestIdentifiers.project(4),
      title: 'Sprint quiz',
      description: null,
      questions: [
        expect.objectContaining({
          points: 1000,
          questionText: 'What color is the sky?',
          timeLimit: 20,
          type: QuizQuestionType.Multiple,
        }),
      ],
    });
    expect(quiz).toBe(createdQuiz);
  });

  it('does not create a quiz when import parsing fails', async () => {
    const quizRepository = {
      createWithQuestions: vi.fn(),
    } as unknown as QuizManagementRepository;
    const accessGuard = {
      assertCanManageProject: vi.fn().mockResolvedValue(undefined),
    };
    const importQuestionMapper = {
      map: vi.fn().mockImplementation(async () => {
        throw new Error(QuizErrorCode.QUIZ_IMPORT_INVALID_FILE);
      }),
    } as unknown as QuizImportQuestionMapper;
    const useCase = new CreateQuizFromImportUseCase(
      quizRepository,
      accessGuard as never,
      importQuestionMapper,
    );

    await expect(
      useCase.execute(
        {
          projectId: backendTestIdentifiers.project(4),
          title: 'Sprint quiz',
          description: null,
          source: new TestPlayableContentImportSource('quiz-import.json'),
        },
        backendTestIdentifiers.user(12),
      ),
    ).rejects.toThrow(QuizErrorCode.QUIZ_IMPORT_INVALID_FILE);
    expect(quizRepository.createWithQuestions).not.toHaveBeenCalled();
  });
});
