import { describe, expect, it } from 'vitest';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import { createQuizMediaMutationFixture } from '../../../../../test-utils/fixtures/unit/quiz-media-mutation.fixture';
import { CreateQuizQuestionUseCase } from './create-quiz-question-use-case';

describe('CreateQuizQuestionUseCase', () => {
  it('rejects an unauthorized mutation before processing or external storage', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    fixture.assertCanManageProject.mockRejectedValue(new Error('NOT_A_MEMBER'));
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
    );
    // Act
    const result = await useCase.execute(fixture.command, fixture.userId).catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('NOT_A_MEMBER');
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
  });

  it('validates answers before processing media', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
    );
    // Act
    const result = await useCase
      .execute({ ...fixture.command, answers: [] }, fixture.userId)
      .catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('INVALID_CORRECT_ANSWER');
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
  });

  it('persists the published asset reference after permission checks', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
    );
    // Act
    await useCase.execute(fixture.command, fixture.userId);
    // Assert
    expect(fixture.save).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        media: { id: 'asset', mimeType: 'image/webp', uri: 'https://cdn.example.test/asset.webp' },
      }),
    );
    expect(fixture.assertCanManageProject.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.publisher.publish.mock.invocationCallOrder[0],
    );
  });
});
