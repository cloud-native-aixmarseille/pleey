import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../../../application/game/types/quiz/services/quiz-question-identifier';
import { GetQuizQuestionMediaUseCase } from '../../../../../application/game/types/quiz/use-cases/get-quiz-question-media-use-case';
import { Media } from '../../../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { QuizQuestionMediaController } from './quiz-question-media-controller';

type MockResponse = {
  setHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

describe('QuizQuestionMediaController', () => {
  it('serves question media with cache headers', async () => {
    // Arrange
    const content = Buffer.from('question-media', 'utf8');
    const getQuizQuestionMediaUseCase = {
      execute: vi.fn().mockResolvedValue(new Media(null, 'image/png', content)),
    } as unknown as GetQuizQuestionMediaUseCase;
    const quizQuestionIdentifier = {
      parse: vi.fn().mockReturnValue(backendTestIdentifiers.partyStage(7)),
    } as unknown as QuizQuestionIdentifier;
    const controller = new QuizQuestionMediaController(getQuizQuestionMediaUseCase, quizQuestionIdentifier);
    const response: MockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };

    // Act
    await controller.getQuestionMedia(backendTestIdentifiers.partyStage(7), response as never);

    // Assert
    expect(quizQuestionIdentifier.parse).toHaveBeenCalledWith(backendTestIdentifiers.partyStage(7));
    expect(getQuizQuestionMediaUseCase.execute).toHaveBeenCalledWith(backendTestIdentifiers.partyStage(7));
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(response.send).toHaveBeenCalledWith(content);
  });
});
