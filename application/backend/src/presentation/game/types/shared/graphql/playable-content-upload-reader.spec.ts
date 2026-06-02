import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { PlayableContentImportParserErrorCode } from '../../../../../application/game/types/shared/services/playable-content-import/playable-content-import-parser';
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
  it('returns an import source that can buffer uploaded content on demand', async () => {
    const reader = new PlayableContentUploadReader();
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () => Readable.from(['{"items":[]}']),
        filename: 'import.json',
        mimetype: 'application/json',
      }),
    );

    await expect(source.readAll()).resolves.toBe('{"items":[]}');
    await expect(collectLines(source)).resolves.toEqual(['{"items":[]}']);
  });

  it('streams uploaded lines without buffering the entire file first', async () => {
    const reader = new PlayableContentUploadReader();
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () =>
          Readable.from(['Prompt: Which team scores first?\n', '- [x] Home\n', '- [ ] Away']),
        filename: 'import.txt',
        mimetype: 'text/plain',
      }),
    );

    await expect(collectLines(source)).resolves.toEqual([
      'Prompt: Which team scores first?',
      '- [x] Home',
      '- [ ] Away',
    ]);
  });

  it('rejects files that exceed the configured import size limit', async () => {
    const reader = new PlayableContentUploadReader();
    const source = await reader.read(
      Promise.resolve({
        createReadStream: () =>
          Readable.from([Buffer.alloc(DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES + 1)]),
        filename: 'too-large.json',
        mimetype: 'application/json',
      }),
    );

    await expect(source.readAll()).rejects.toThrow(
      PlayableContentImportParserErrorCode.INVALID_FILE,
    );
  });
});
