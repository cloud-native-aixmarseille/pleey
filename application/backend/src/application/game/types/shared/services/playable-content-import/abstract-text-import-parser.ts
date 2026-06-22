import { AbstractPlayableContentImportFormatParser } from './abstract-playable-content-import-format-parser';
import type { PlayableContentImportFormatParser } from './import-format-parser';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import type { RawImportItem, RawImportOption } from './import-parser.types';
import { PlayableImportFormat, PlayableImportItemKind } from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';

export abstract class AbstractTextPlayableContentImportFormatParser
  extends AbstractPlayableContentImportFormatParser
  implements PlayableContentImportFormatParser
{
  abstract readonly format: PlayableImportFormat.MARKDOWN | PlayableImportFormat.PLAINTEXT;
  protected abstract readonly supportedFileExtensions: readonly string[];

  async canParse(source: PlayableContentImportSource): Promise<boolean> {
    const supportFromFileName = this.resolveSupportFromFileName(
      source.fileName,
      this.supportedFileExtensions,
    );

    if (supportFromFileName !== null) {
      return supportFromFileName;
    }

    return this.canParseContent((await source.readAll()).trim());
  }

  protected abstract canParseContent(content: string): boolean;

  async parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]> {
    const items: RawImportItem[] = [];
    let blockLines: string[] = [];

    for await (const line of source.readLines()) {
      if (line.trim().length === 0) {
        this.pushBlock(blockLines, items);
        blockLines = [];
        continue;
      }

      blockLines.push(line);
    }

    this.pushBlock(blockLines, items);

    return items;
  }

  protected pushBlock(blockLines: readonly string[], items: RawImportItem[]): void {
    const item = this.parseBlock(blockLines);

    if (item !== null) {
      items.push(item);
    }
  }

  protected parseBlock(blockLines: readonly string[]): RawImportItem | null {
    const lines = blockLines.map((line) => line.trim()).filter((line) => line.length > 0);

    if (lines.length === 0) {
      return null;
    }

    if (lines.length === 1 && /^#\s+/u.test(lines[0])) {
      return null;
    }

    let text = '';
    let kind: PlayableImportItemKind | undefined;
    let timeLimit: number | undefined;
    let points: number | undefined;
    const options: RawImportOption[] = [];

    for (const line of lines) {
      const metadata = this.parseMetadataLine(line);

      if (metadata !== null) {
        if (metadata.kind) {
          kind = metadata.kind;
        }
        if (metadata.timeLimit !== undefined) {
          timeLimit = metadata.timeLimit;
        }
        if (metadata.points !== undefined) {
          points = metadata.points;
        }
        continue;
      }

      const option = this.parseOption(line);

      if (option !== null) {
        options.push(option);
        continue;
      }

      const normalizedLine = line
        .replace(/^#{1,6}\s+/u, '')
        .replace(/^(question|prompt)\s*:\s*/iu, '')
        .trim();

      if (text.length === 0) {
        text = normalizedLine;
      } else {
        text = `${text} ${normalizedLine}`.trim();
      }
    }

    if (text.length === 0 && options.length === 0) {
      return null;
    }

    return {
      kind,
      options,
      points,
      text,
      timeLimit,
    };
  }

  private parseMetadataLine(line: string): {
    readonly kind?: PlayableImportItemKind;
    readonly points?: number;
    readonly timeLimit?: number;
  } | null {
    const normalizedLine = line.toLowerCase();

    if (normalizedLine.startsWith('type:')) {
      return {
        kind: this.normalizeKind(line.split(':').slice(1).join(':')),
      };
    }

    if (normalizedLine.startsWith('time:') || normalizedLine.startsWith('timelimit:')) {
      return {
        timeLimit: this.parseOptionalNumber(line.split(':').slice(1).join(':')),
      };
    }

    if (normalizedLine.startsWith('points:') || normalizedLine.startsWith('score:')) {
      return {
        points: this.parseOptionalNumber(line.split(':').slice(1).join(':')),
      };
    }

    return null;
  }

  private parseOption(line: string): RawImportOption | null {
    const match = line.match(/^(?:[-*+]\s+|\d+\.\s+)?(?:\[(x|X| )\]\s*)?(.+)$/u);

    if (!match) {
      return null;
    }

    const hasExplicitListPrefix = /^(?:[-*+]\s+|\d+\.\s+|\[(?:x|X| )\]\s*)/u.test(line);

    if (!hasExplicitListPrefix) {
      return null;
    }

    return {
      isCorrect: (match[1] ?? '').toLowerCase() === 'x',
      text: match[2].trim(),
    };
  }
  protected invalidFile(): never {
    throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
  }
}
