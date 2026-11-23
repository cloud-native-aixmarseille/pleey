import { Readable } from 'node:stream';
import { vi } from 'vitest';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { GraphqlUploadReader } from '../../presentation/shared/graphql/graphql-upload-reader';

export class GraphqlUploadFixtureFactory {
  create({
    chunks = [Buffer.from('upload')],
    maxFileSizeBytes = 16,
  }: {
    readonly chunks?: readonly (string | Uint8Array)[];
    readonly maxFileSizeBytes?: number;
  } = {}) {
    const stream = Readable.from(chunks);
    const file = {
      filename: 'upload.bin',
      mimetype: 'application/octet-stream',
      createReadStream: vi.fn(() => stream),
    };
    const options = {
      maxFileSizeBytes,
      invalidFile: (failure: { readonly reason: string }) =>
        new DomainError({ code: 'TEST_UPLOAD_INVALID', messageKey: 'TEST_UPLOAD_INVALID' }, { ...failure }),
    };
    return { reader: new GraphqlUploadReader(), file, stream, options };
  }
}
