import { describe, expect, it } from 'vitest';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import { createQuizMediaMutationFixture } from '../../../../../test-utils/fixtures/unit/quiz-media-mutation.fixture';
import { CreateQuizQuestionUseCase } from './create-quiz-question-use-case';

describe('CreateQuizQuestionUseCase', () => {
  it('rejects an unauthorized mutation before reading, processing or external storage', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    fixture.assertCanManageProject.mockRejectedValue(new Error('NOT_A_MEMBER'));
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
      fixture.preparation,
    );
    // Act
    const result = await useCase.execute(fixture.command, fixture.userId).catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('NOT_A_MEMBER');
    expect(fixture.openMedia).not.toHaveBeenCalled();
    expect(fixture.readMedia).not.toHaveBeenCalled();
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
      fixture.preparation,
    );
    // Act
    const result = await useCase
      .execute({ ...fixture.command, answers: [] }, fixture.userId)
      .catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('INVALID_CORRECT_ANSWER');
    expect(fixture.openMedia).not.toHaveBeenCalled();
    expect(fixture.readMedia).not.toHaveBeenCalled();
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
      fixture.preparation,
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
      fixture.openMedia.mock.invocationCallOrder[0],
    );
    expect(fixture.openMedia).toHaveBeenCalledExactlyOnceWith(5 * 1024 * 1024);
    expect(fixture.openMedia.mock.invocationCallOrder[0]).toBeLessThan(fixture.readMedia.mock.invocationCallOrder[0]);
    expect(fixture.readMedia.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.publisher.publish.mock.invocationCallOrder[0],
    );
  });

  it('rejects unsupported MIME metadata before consuming an application upload source', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    fixture.upload.mimeType = 'image/svg+xml';
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
      fixture.preparation,
    );

    // Act + Assert
    await expect(useCase.execute(fixture.command, fixture.userId)).rejects.toMatchObject({
      code: 'INVALID_QUESTION_MEDIA',
      context: { reason: 'unsupportedMimeType' },
    });
    expect(fixture.readMedia).not.toHaveBeenCalled();
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
  });

  it.each([
    { bytes: 0, reason: 'emptyFile' },
    { bytes: 5 * 1024 * 1024 + 1, reason: 'uploadTooLarge' },
  ])('rejects $reason from any upload source before publication', async ({ bytes, reason }) => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    fixture.readMedia.mockResolvedValue(Buffer.alloc(bytes));
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
      fixture.preparation,
    );

    // Act + Assert
    await expect(useCase.execute(fixture.command, fixture.userId)).rejects.toMatchObject({
      code: 'INVALID_QUESTION_MEDIA',
      context: { reason },
    });
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
  });

  it.each(['openMedia', 'readMedia'] as const)('does not publish or save when %s fails', async (operation) => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    const failure = new Error('upload failed');
    fixture[operation].mockRejectedValue(failure);
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
      fixture.preparation,
    );

    // Act + Assert
    await expect(useCase.execute(fixture.command, fixture.userId)).rejects.toBe(failure);
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.publisher.discard).not.toHaveBeenCalled();
  });

  it('creates a question without media', async () => {
    // Arrange
    const fixture = createQuizMediaMutationFixture();
    const useCase = new CreateQuizQuestionUseCase(
      fixture.quizRepository,
      fixture.questionRepository,
      fixture.guard,
      new SelectableOptionPolicy(),
      fixture.mutation,
      fixture.preparation,
    );

    // Act
    await useCase.execute({ ...fixture.command, media: null }, fixture.userId);

    // Assert
    expect(fixture.save).toHaveBeenCalledWith(fixture.command.quizId, expect.objectContaining({ media: null }));
    expect(fixture.openMedia).not.toHaveBeenCalled();
    expect(fixture.publisher.publish).not.toHaveBeenCalled();
  });
});
