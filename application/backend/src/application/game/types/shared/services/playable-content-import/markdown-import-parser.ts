import { Injectable } from '@nestjs/common';
import { AbstractTextPlayableContentImportFormatParser } from './abstract-text-import-parser';
import { PlayableImportFormat } from './import-parser.types';

@Injectable()
export class MarkdownPlayableContentImportFormatParser extends AbstractTextPlayableContentImportFormatParser {
  readonly format = PlayableImportFormat.MARKDOWN;
  protected readonly supportedFileExtensions = ['.md', '.markdown'] as const;

  protected override canParseContent(content: string): boolean {
    if (content.length === 0) {
      return false;
    }

    const firstLine = content.split(/\r?\n/u)[0]?.toLowerCase() ?? '';

    return /^#{1,6}\s+/u.test(firstLine) || content.includes('- [') || content.includes('* [');
  }
}
