import { PlayableImportItemKind } from './import-parser.types';

export abstract class AbstractPlayableContentImportFormatParser {
  protected resolveSupportFromFileName(
    fileName: string,
    supportedFileExtensions: readonly string[],
  ): boolean | null {
    const normalizedFileName = fileName.toLowerCase();

    if (supportedFileExtensions.some((extension) => normalizedFileName.endsWith(extension))) {
      return true;
    }

    if (normalizedFileName.includes('.')) {
      return false;
    }

    return null;
  }

  protected normalizeKind(value: string | undefined): PlayableImportItemKind | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.toLowerCase().replace(/[^a-z]/gu, '');

    if (normalized === 'truefalse' || normalized === 'boolean') {
      return PlayableImportItemKind.TRUE_FALSE;
    }

    return PlayableImportItemKind.MULTIPLE;
  }

  protected parseOptionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const parsed = Number.parseInt(value.trim(), 10);

    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
