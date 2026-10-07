export abstract class ThemeImageProcessorPort {
  abstract process(
    content: Uint8Array,
    mimeType: string,
  ): Promise<{ readonly content: Uint8Array; readonly width: number; readonly height: number }>;
}
export interface ThemeAssetUploadSource {
  read(): Promise<{ readonly content: Uint8Array; readonly mimeType: string }>;
}
