import { Injectable } from '@nestjs/common';
import { AbstractPlayableContentImportFormatParser } from './abstract-playable-content-import-format-parser';
import type { PlayableContentImportFormatParser } from './import-format-parser';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import type { RawImportItem, RawImportOption } from './import-parser.types';
import {
  PlayableImportFormat,
  PlayableImportItemKind,
  TRUE_FALSE_OPTION_TEXTS,
} from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';

interface CsvHeaderContext {
  readonly correctIndex: number | null;
  readonly kindIndex: number | null;
  readonly optionIndexes: readonly number[];
  readonly pointsIndex: number | null;
  readonly textIndex: number;
  readonly timeLimitIndex: number | null;
}

@Injectable()
export class CsvPlayableContentImportFormatParser
  extends AbstractPlayableContentImportFormatParser
  implements PlayableContentImportFormatParser
{
  readonly format = PlayableImportFormat.CSV;

  async canParse(source: PlayableContentImportSource): Promise<boolean> {
    const supportFromFileName = this.resolveSupportFromFileName(source.fileName, ['.csv']);

    if (supportFromFileName !== null) {
      return supportFromFileName;
    }

    const content = (await source.readAll()).trim();

    if (content.length === 0) {
      return false;
    }

    const firstLine = content.split(/\r?\n/u)[0]?.toLowerCase() ?? '';

    return (
      firstLine.includes(',') && (firstLine.includes('question') || firstLine.includes('prompt'))
    );
  }

  async parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]> {
    let headerContext: CsvHeaderContext | null = null;
    const items: RawImportItem[] = [];

    for await (const line of source.readLines()) {
      const normalizedLine = line.trim();

      if (normalizedLine.length === 0) {
        continue;
      }

      const row = this.parseCsvLine(normalizedLine);

      if (headerContext === null) {
        headerContext = this.createHeaderContext(row);
        continue;
      }

      items.push(this.parseRow(row, headerContext));
    }

    if (headerContext === null) {
      return [];
    }

    if (items.length === 0) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return items;
  }

  private createHeaderContext(headerRow: readonly string[]): CsvHeaderContext {
    const headers = headerRow.map((value) => value.trim().toLowerCase());
    const textIndex = this.findHeaderIndex(headers, [
      'prompt',
      'prompttext',
      'question',
      'questiontext',
      'text',
    ]);
    const kindIndex = this.findHeaderIndex(headers, ['type', 'kind']);
    const timeLimitIndex = this.findHeaderIndex(headers, ['timelimit', 'time', 'seconds']);
    const pointsIndex = this.findHeaderIndex(headers, ['points', 'score']);
    const correctIndex = this.findHeaderIndex(headers, [
      'correct',
      'correctanswers',
      'correctpositions',
      'answer',
    ]);
    const optionIndexes = headers
      .map((header, index) => ({ header, index }))
      .filter(({ header }) => /^option\d+$/u.test(header) || /^answer\d+$/u.test(header))
      .map(({ index }) => index);

    if (textIndex === null) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return {
      correctIndex,
      kindIndex,
      optionIndexes,
      pointsIndex,
      textIndex,
      timeLimitIndex,
    };
  }

  private parseRow(row: readonly string[], headerContext: CsvHeaderContext): RawImportItem {
    const declaredKind = this.normalizeKind(
      headerContext.kindIndex === null ? undefined : row[headerContext.kindIndex],
    );
    const optionTexts = headerContext.optionIndexes
      .map((index) => row[index]?.trim() ?? '')
      .filter((value) => value.length > 0);
    const inferredKind = declaredKind ?? this.inferKindFromOptionTexts(optionTexts);
    const resolvedOptionTexts =
      inferredKind === PlayableImportItemKind.TRUE_FALSE && optionTexts.length === 0
        ? [...TRUE_FALSE_OPTION_TEXTS]
        : optionTexts;
    const correctValue =
      headerContext.correctIndex === null ? '' : (row[headerContext.correctIndex] ?? '');

    return {
      kind: inferredKind,
      options: this.createOptions(resolvedOptionTexts, correctValue, inferredKind),
      points: this.parseOptionalNumber(
        headerContext.pointsIndex === null ? undefined : row[headerContext.pointsIndex],
      ),
      text: row[headerContext.textIndex] ?? '',
      timeLimit: this.parseOptionalNumber(
        headerContext.timeLimitIndex === null ? undefined : row[headerContext.timeLimitIndex],
      ),
    };
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let isInQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const currentCharacter = line[index];
      const nextCharacter = line[index + 1];

      if (currentCharacter === '"') {
        if (isInQuotes && nextCharacter === '"') {
          currentValue += '"';
          index += 1;
          continue;
        }

        isInQuotes = !isInQuotes;
        continue;
      }

      if (currentCharacter === ',' && !isInQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }

      currentValue += currentCharacter;
    }

    values.push(currentValue.trim());

    return values;
  }

  private createOptions(
    optionTexts: readonly string[],
    correctValue: string,
    kind: PlayableImportItemKind,
  ): readonly RawImportOption[] {
    const normalizedOptions = optionTexts.map((option) => option.trim()).filter(Boolean);

    if (normalizedOptions.length === 0) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    if (kind === PlayableImportItemKind.TRUE_FALSE) {
      const booleanAnswer = this.parseBooleanish(correctValue);

      if (booleanAnswer === null) {
        throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
      }

      return TRUE_FALSE_OPTION_TEXTS.map((optionText) => ({
        isCorrect: optionText.toLowerCase() === booleanAnswer,
        text: optionText,
      }));
    }

    const correctTokens = correctValue
      .split(/[|;]/u)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    if (correctTokens.length === 0) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return normalizedOptions.map((optionText, index) => ({
      isCorrect:
        correctTokens.includes(String(index + 1)) ||
        correctTokens.includes(optionText.toLowerCase()),
      text: optionText,
    }));
  }

  private inferKindFromOptionTexts(options: readonly string[]): PlayableImportItemKind {
    const normalized = options.map((option) => option.toLowerCase());

    return options.length === 2 && normalized.includes('true') && normalized.includes('false')
      ? PlayableImportItemKind.TRUE_FALSE
      : PlayableImportItemKind.MULTIPLE;
  }
  private parseBooleanish(value: string): 'false' | 'true' | null {
    const normalized = value.trim().toLowerCase();

    if (['true', 't', 'yes', 'y', '1'].includes(normalized)) {
      return 'true';
    }

    if (['false', 'f', 'no', 'n', '0', '2'].includes(normalized)) {
      return 'false';
    }

    return null;
  }

  private findHeaderIndex(
    headers: readonly string[],
    candidates: readonly string[],
  ): number | null {
    for (const candidate of candidates) {
      const index = headers.indexOf(candidate);

      if (index >= 0) {
        return index;
      }
    }

    return null;
  }
}
