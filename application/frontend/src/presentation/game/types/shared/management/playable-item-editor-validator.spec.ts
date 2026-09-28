import { describe, expect, it } from 'vitest';
import { PlayableItemEditorStateFixtureFactory } from '../../../../../test-utils/fixtures/playable-item-editor-state-fixture-factory';
import { PlayableItemEditorValidator } from './playable-item-editor-validator';

describe('PlayableItemEditorValidator', () => {
  it.each([
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/vnd.wave',
    'audio/ogg',
    'video/mp4',
    'video/webm',
  ])('accepts a supported %s upload', (type) => {
    // Arrange
    const state = new PlayableItemEditorStateFixtureFactory().create({
      mediaFile: new File(['media'], 'prompt', { type }),
    });
    const validator = new PlayableItemEditorValidator();

    // Act
    const issues = validator.validate(state);

    // Assert
    expect(issues).toEqual([]);
  });

  it.each(['image/gif', 'image/svg+xml', 'audio/flac', 'video/quicktime', 'application/octet-stream', ''])(
    'rejects a format outside the supported list: %s',
    (type) => {
      // Arrange
      const state = new PlayableItemEditorStateFixtureFactory().create({
        mediaFile: new File(['media'], 'prompt.png', { type }),
      });
      const validator = new PlayableItemEditorValidator();

      // Act
      const issues = validator.validate(state);

      // Assert
      expect(issues).toEqual([{ code: 'unsupportedMediaType' }]);
    },
  );

  it.each([
    { size: 5 * 1024 * 1024, expected: [] },
    { size: 5 * 1024 * 1024 + 1, expected: [{ code: 'mediaTooLarge' }] },
  ])('enforces the upload boundary for $size bytes', ({ size, expected }) => {
    // Arrange
    const state = new PlayableItemEditorStateFixtureFactory().create({
      mediaFile: new File([new Uint8Array(size)], 'prompt.png', { type: 'image/png' }),
    });
    const validator = new PlayableItemEditorValidator();

    // Act
    const issues = validator.validate(state);

    // Assert
    expect(issues).toEqual(expected);
  });
});
