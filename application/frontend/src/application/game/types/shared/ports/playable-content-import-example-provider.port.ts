export enum PlayableContentImportExampleFormat {
  CSV = 'csv',
  JSON = 'json',
  MARKDOWN = 'markdown',
  PLAINTEXT = 'plaintext',
}

export const DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS: readonly PlayableContentImportExampleFormat[] = [
  PlayableContentImportExampleFormat.JSON,
  PlayableContentImportExampleFormat.CSV,
  PlayableContentImportExampleFormat.MARKDOWN,
  PlayableContentImportExampleFormat.PLAINTEXT,
];

export interface PlayableContentImportExampleFile {
  readonly content: string;
  readonly fileName: string;
  readonly mimeType: string;
}

export interface PlayableContentImportExampleProvider {
  create(format: PlayableContentImportExampleFormat): PlayableContentImportExampleFile;
  listFormats(): readonly PlayableContentImportExampleFormat[];
}
