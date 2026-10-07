import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import type { ThemeAssetUploadSource } from '../../../application/workspace/themes/ports/theme-image-processor.port';
import { ThemeError, ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
export interface ThemeUploadFile {
  readonly mimetype: string;
  readonly createReadStream: () => Readable;
}
@Injectable()
export class ThemeAssetUploadReader {
  source(upload: Promise<ThemeUploadFile>): ThemeAssetUploadSource {
    return {
      read: async () => {
        let stream: Readable | undefined;
        try {
          const file = await upload;
          stream = file.createReadStream();
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of stream) {
            const buffer = Buffer.from(chunk);
            size += buffer.length;
            if (size > 5 * 1024 * 1024) throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'size' });
            chunks.push(buffer);
          }
          return { content: Buffer.concat(chunks), mimeType: file.mimetype };
        } catch {
          stream?.destroy();
          throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'upload' });
        }
      },
    };
  }
}
