import { Injectable } from '@nestjs/common';
import { AbstractTextPlayableContentImportFormatParser } from './abstract-text-import-parser';
import { PlayableImportFormat } from './import-parser.types';

@Injectable()
export class PlaintextPlayableContentImportFormatParser extends AbstractTextPlayableContentImportFormatParser {
  readonly format = PlayableImportFormat.PLAINTEXT;
  protected readonly supportedFileExtensions = ['.txt'] as const;

  protected override canParseContent(content: string): boolean {
    if (content.length === 0) {
      return false;
    }

    const firstLine = content.split(/\r?\n/u)[0] ?? '';

    return /^(question|prompt)\s*:/iu.test(firstLine);
  }
}
