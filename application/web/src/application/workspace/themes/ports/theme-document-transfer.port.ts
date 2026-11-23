export interface ThemeTemplateFile {
  readonly content: string;
  readonly fileName: string;
  readonly mimeType: string;
}

export interface ThemeTemplateDownloadPort {
  download(file: ThemeTemplateFile): void;
}

export interface ThemeAssetUriReaderPort {
  readAsset(uri: string): Promise<File>;
}

export interface ThemeDocumentFileReaderPort {
  readDocument(file: File): Promise<unknown>;
}

export const ThemeTemplateDownloadPortToken = Symbol('ThemeTemplateDownloadPort');
export const ThemeAssetUriReaderPortToken = Symbol('ThemeAssetUriReaderPort');
export const ThemeDocumentFileReaderPortToken = Symbol('ThemeDocumentFileReaderPort');
