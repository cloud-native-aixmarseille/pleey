import { Inject, Injectable } from '@nestjs/common';
import type { ThemeAssetUploadSource } from '../../../application/workspace/themes/ports/theme-image-processor.port';
import { THEME_ASSET_MAX_FILE_SIZE_BYTES } from '../../../domain/theme/entities/managed-theme';
import { ThemeError, ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
import { type GraphqlUploadFile, GraphqlUploadReader } from '../../shared/graphql/graphql-upload-reader';

@Injectable()
export class ThemeAssetUploadReader {
  constructor(@Inject(GraphqlUploadReader) private readonly uploads: GraphqlUploadReader) {}

  source(upload: Promise<GraphqlUploadFile> | GraphqlUploadFile): ThemeAssetUploadSource {
    return {
      read: async () => {
        const source = await this.uploads.read(upload, {
          maxFileSizeBytes: THEME_ASSET_MAX_FILE_SIZE_BYTES,
          invalidFile: (failure) => new ThemeError(ThemeErrorCode.INVALID_ASSET, { ...failure }),
        });
        const chunks: Buffer[] = [];
        for await (const chunk of source.readChunks()) {
          chunks.push(chunk);
        }
        return { content: Buffer.concat(chunks), mimeType: source.mimeType };
      },
    };
  }
}
