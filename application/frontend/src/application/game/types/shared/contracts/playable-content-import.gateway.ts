import { injectable } from 'inversify';

export enum PlayableContentImportExampleFormat {
  CSV = 'csv',
  JSON = 'json',
  MARKDOWN = 'markdown',
  PLAINTEXT = 'plaintext',
}

export const DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS: readonly PlayableContentImportExampleFormat[] =
  [
    PlayableContentImportExampleFormat.JSON,
    PlayableContentImportExampleFormat.CSV,
    PlayableContentImportExampleFormat.MARKDOWN,
    PlayableContentImportExampleFormat.PLAINTEXT,
  ];

const playableContentImportAcceptedTypesByFormat: Readonly<
  Record<PlayableContentImportExampleFormat, readonly string[]>
> = {
  [PlayableContentImportExampleFormat.CSV]: ['.csv', 'text/csv'],
  [PlayableContentImportExampleFormat.JSON]: ['.json', 'application/json'],
  [PlayableContentImportExampleFormat.MARKDOWN]: ['.md', '.markdown', 'text/markdown'],
  [PlayableContentImportExampleFormat.PLAINTEXT]: ['.txt', 'text/plain'],
};

export interface PlayableContentImportExampleFile {
  readonly content: string;
  readonly fileName: string;
  readonly mimeType: string;
}

export interface PlayableContentImportExampleProvider {
  create(format: PlayableContentImportExampleFormat): PlayableContentImportExampleFile;
  listFormats(): readonly PlayableContentImportExampleFormat[];
}

@injectable()
export class PlayableContentImportAcceptedTypesResolver {
  resolve(formats: readonly PlayableContentImportExampleFormat[]): string {
    return Array.from(
      new Set(
        formats.flatMap((format) => playableContentImportAcceptedTypesByFormat[format] ?? []),
      ),
    ).join(',');
  }
}
