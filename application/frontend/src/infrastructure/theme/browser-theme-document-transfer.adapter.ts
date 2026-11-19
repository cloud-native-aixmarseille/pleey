import { THEME_ASSET_POLICY } from '@pleey/domain/theme';
import { injectable } from 'inversify';
import type {
  ThemeAssetUriReaderPort,
  ThemeDocumentFileReaderPort,
  ThemeTemplateDownloadPort,
  ThemeTemplateFile,
} from '../../application/workspace/themes/ports/theme-document-transfer.port';
import { ThemeError, ThemeErrorCode } from '../../domains/theme/errors/theme-error';

@injectable()
export class BrowserThemeDocumentTransferAdapter
  implements ThemeTemplateDownloadPort, ThemeDocumentFileReaderPort, ThemeAssetUriReaderPort
{
  download(file: ThemeTemplateFile): void {
    const objectUrl = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  readDocument(file: File): Promise<unknown> {
    if (typeof file.text === 'function') return file.text().then((content) => JSON.parse(content));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        try {
          resolve(JSON.parse(typeof reader.result === 'string' ? reader.result : ''));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  async readAsset(uri: string): Promise<File> {
    const url = new URL(uri, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { field: 'uri' });
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { field: 'uri', status: response.status });
    }
    const blob = await response.blob();
    if (blob.size > THEME_ASSET_POLICY.maxFileSizeBytes || !THEME_ASSET_POLICY.acceptedMimeTypes.includes(blob.type)) {
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { field: 'uri' });
    }
    return new File([blob], this.fileName(url, blob.type), { type: blob.type });
  }

  private fileName(url: URL, mimeType: string): string {
    const name = url.pathname.split('/').pop();
    if (name?.includes('.')) return name;
    const extension = mimeType === 'image/jpeg' ? 'jpg' : (mimeType.split('/')[1] ?? 'png');
    return `theme-asset.${extension}`;
  }
}
