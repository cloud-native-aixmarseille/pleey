import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { PlayableContentImportParserErrorCode } from '../../../../../application/game/types/shared/services/playable-content-import/playable-content-import-parser';
import { GraphqlUploadReader } from '../../../../shared/graphql/graphql-upload-reader';
import { DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES } from './playable-content-upload.constants';
import { PlayableContentUploadReader } from './playable-content-upload-reader';

const collectLines = async (source: Awaited<ReturnType<PlayableContentUploadReader['read']>>) => {
  const lines: string[] = [];

  for await (const line of source.readLines()) {
    lines.push(line);
  }

  return lines;
};

describe('PlayableContentUploadReader', () => {
  it('preserves split UTF-8 characters and CRLF lines without opening the stream early', async () => {
    // Arrange
    const reader = new PlayableContentUploadReader(new GraphqlUploadReader());
    const text = Buffer.from('Été\r\n🎉\n');
    const createReadStream = vi.fn(() => Readable.from([...text].map((byte) => Buffer.from([byte]))));
    const source = await reader.read(
      Promise.resolve({ filename: 'import.txt', mimetype: 'text/plain', createReadStream }),
    );
    expect(createReadStream).not.toHaveBeenCalled();

    // Act + Assert
    await expect(collectLines(source)).resolves.toEqual(['Été', '🎉']);
  });

  it('uses its configured byte limit rather than the theme asset limit', async () => {
    // Arrange
    const reader = new PlayableContentUploadReader(new GraphqlUploadReader(), 3);
    const source = await reader.read(
      Promise.resolve({
        filename: 'import.txt',
        mimetype: 'text/plain',
        createReadStream: () => Readable.from(['éé']),
      }),
    );

    // Act + Assert
    await expect(source.readAll()).rejects.toThrow(PlayableContentImportParserErrorCode.INVALID_FILE);
  });

  it('returns an import source that can buffer uploaded content on demand', async () => {
    // Arrange
    const reader = new PlayableContentUploadReader(new GraphqlUploadReader());
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () => Readable.from(['{"items":[]}']),
        filename: 'import.json',
        mimetype: 'application/json',
      }),
    );

    // Act + Assert
    await expect(source.readAll()).resolves.toBe('{"items":[]}');
    await expect(collectLines(source)).resolves.toEqual(['{"items":[]}']);
  });

  it('streams uploaded lines without buffering the entire file first', async () => {
    // Arrange
    const reader = new PlayableContentUploadReader(new GraphqlUploadReader());
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () => Readable.from(['Prompt: Which team scores first?\n', '- [x] Home\n', '- [ ] Away']),
        filename: 'import.txt',
        mimetype: 'text/plain',
      }),
    );

    // Act + Assert
    await expect(collectLines(source)).resolves.toEqual([
      'Prompt: Which team scores first?',
      '- [x] Home',
      '- [ ] Away',
    ]);
  });

  it('rejects files that exceed the configured import size limit', async () => {
    // Arrange
    const reader = new PlayableContentUploadReader(new GraphqlUploadReader());
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () => Readable.from([Buffer.alloc(DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES + 1)]),
        filename: 'too-large.json',
        mimetype: 'application/json',
      }),
    );

    // Act + Assert
    await expect(source.readAll()).rejects.toThrow(PlayableContentImportParserErrorCode.INVALID_FILE);
  });
});
