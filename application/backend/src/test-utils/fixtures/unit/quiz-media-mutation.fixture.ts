import { vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../application/game/types/quiz/services/quiz-question-identifier';
import { GameTypeIdentifier } from '../../../application/game/types/shared/services/game-type-identifier';
import type { GameTypeManagementAccessGuard } from '../../../application/game/types/shared/services/game-type-management-access-guard';
import { MediaMutationService } from '../../../application/media/services/media-mutation.service';
import { Quiz } from '../../../domain/game/types/quiz/entities/quiz';
import { QuizQuestion, QuizQuestionType } from '../../../domain/game/types/quiz/entities/quiz-question';
import type { QuizManagementRepository } from '../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { QuizQuestionRepository } from '../../../domain/game/types/quiz/ports/quiz-question.repository';
import { Media } from '../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../branded-identifiers';

export function createQuizMediaMutationFixture() {
  const quizId = new GameTypeIdentifier().parse(backendTestIdentifiers.game(5));
  const questionId = new QuizQuestionIdentifier().parse(backendTestIdentifiers.partyStage(10));
  const quiz = new Quiz(
    quizId,
    backendTestIdentifiers.game(6),
    backendTestIdentifiers.project(1),
    'Quiz',
    null,
    new Date(),
    1,
  );
  const question = new QuizQuestion(questionId, quizId, 0, 'Question', QuizQuestionType.Multiple, 20, 100, []);
  const findQuiz = vi.fn().mockResolvedValue(quiz);
  const save = vi.fn().mockResolvedValue(question);
  const assertCanManageProject = vi.fn().mockResolvedValue(undefined);
  const publisher = {
    publish: vi
      .fn()
      .mockResolvedValue({ id: 'asset', mimeType: 'image/webp', uri: 'https://cdn.example.test/asset.webp' }),
    discard: vi.fn().mockResolvedValue(undefined),
  };
  return {
    command: {
      quizId,
      questionId,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [
        { text: 'Yes', isCorrect: true, position: 0 },
        { text: 'No', isCorrect: false, position: 1 },
      ],
      media: new Media(null, 'image/png', Buffer.from('input')),
    },
    userId: backendTestIdentifiers.user(1),
    quizRepository: { findById: findQuiz } as unknown as QuizManagementRepository,
    questionRepository: {
      findById: vi.fn().mockResolvedValue(question),
      create: save,
      update: save,
    } as unknown as QuizQuestionRepository,
    guard: { assertCanManageProject } as unknown as GameTypeManagementAccessGuard,
    mutation: new MediaMutationService(publisher),
    publisher,
    save,
    findQuiz,
    assertCanManageProject,
  };
}
