import { Injectable } from '@nestjs/common';
import { AbstractPlayableContentImportFormatParser } from './abstract-playable-content-import-format-parser';
import type { PlayableContentImportFormatParser } from './import-format-parser';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import type {
  JsonItemRecord,
  JsonOptionRecord,
  RawImportItem,
  RawImportOption,
} from './import-parser.types';
import { PlayableImportFormat } from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';

@Injectable()
export class JsonPlayableContentImportFormatParser
  extends AbstractPlayableContentImportFormatParser
  implements PlayableContentImportFormatParser
{
  readonly format = PlayableImportFormat.JSON;

  async canParse(source: PlayableContentImportSource): Promise<boolean> {
    const supportFromFileName = this.resolveSupportFromFileName(source.fileName, ['.json']);

    if (supportFromFileName !== null) {
      return supportFromFileName;
    }

    const content = (await source.readAll()).trim();

    return content.startsWith('{') || content.startsWith('[');
  }

  async parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]> {
    const content = (await source.readAll()).trim();

    if (content.length === 0) {
      return [];
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content) as unknown;
    } catch {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    const itemRecords = Array.isArray(parsed)
      ? parsed
      : this.isRecord(parsed)
        ? Array.isArray(parsed.items)
          ? parsed.items
          : Array.isArray(parsed.questions)
            ? parsed.questions
            : Array.isArray(parsed.prompts)
              ? parsed.prompts
              : null
        : null;

    if (!itemRecords) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return itemRecords.map((record) => this.parseItem(record));
  }

  private parseItem(record: unknown): RawImportItem {
    if (!this.isRecord(record)) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    const item = record as JsonItemRecord;
    const options = item.answers ?? item.options;

    if (!Array.isArray(options)) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return {
      kind: this.normalizeKind(item.type),
      options: options.map((option) => this.parseOption(option)),
      points: this.parseOptionalNumber(item.points),
      text: this.resolveItemText(item),
      timeLimit: this.parseOptionalNumber(item.timeLimit),
    };
  }

  private parseOption(option: JsonOptionRecord): RawImportOption {
    if (typeof option === 'string') {
      return {
        isCorrect: false,
        text: option,
      };
    }

    if (!this.isRecord(option)) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    const text = option.text ?? option.label ?? option.answer;

    if (typeof text !== 'string') {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return {
      isCorrect: option.isCorrect === true || option.correct === true,
      text,
    };
  }

  private resolveItemText(item: JsonItemRecord): string {
    const text = item.questionText ?? item.question ?? item.promptText ?? item.prompt ?? item.text;

    if (typeof text !== 'string') {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return text;
  }
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
