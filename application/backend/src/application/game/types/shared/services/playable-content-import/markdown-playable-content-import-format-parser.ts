import { Injectable } from '@nestjs/common';
import { AbstractTextPlayableContentImportFormatParser } from './abstract-text-import-parser';
import type { RawImportItem } from './import-parser.types';
import { PlayableImportFormat } from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';

@Injectable()
export class MarkdownPlayableContentImportFormatParser extends AbstractTextPlayableContentImportFormatParser {
  readonly format = PlayableImportFormat.MARKDOWN;
  protected readonly supportedFileExtensions = ['.md', '.markdown'] as const;

  override async parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]> {
    const items: RawImportItem[] = [];
    let blockLines: string[] = [];

    for await (const line of source.readLines()) {
      const trimmedLine = line.trim();

      if (trimmedLine.length === 0) {
        continue;
      }

      if (/^#\s+/u.test(trimmedLine)) {
        this.pushBlock(blockLines, items);
        blockLines = [];
        continue;
      }

      if (/^#{2,6}\s+/u.test(trimmedLine)) {
        this.pushBlock(blockLines, items);
        blockLines = [line];
        continue;
      }

      blockLines.push(line);
    }

    this.pushBlock(blockLines, items);

    return items;
  }

  protected override canParseContent(content: string): boolean {
    if (content.length === 0) {
      return false;
    }

    const firstLine = content.split(/\r?\n/u)[0]?.toLowerCase() ?? '';

    return /^#{1,6}\s+/u.test(firstLine) || content.includes('- [') || content.includes('* [');
  }
}
