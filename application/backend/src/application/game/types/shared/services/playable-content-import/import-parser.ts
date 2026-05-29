import { Injectable } from '@nestjs/common';
import type { SelectableOptionInput } from '../../../../../../domain/game/types/shared/entities/selectable-option';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import {
  DEFAULT_POINTS,
  DEFAULT_TIME_LIMIT,
  type PlayableImportItemDefinition,
  PlayableImportItemKind,
  type RawImportItem,
  type RawImportOption,
  TRUE_FALSE_OPTION_TEXTS,
} from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';
import { PlayableContentImportParserContainer } from './playable-content-import-parser-container';

export { PlayableContentImportParserErrorCode } from './import-parser.error';

@Injectable()
export class PlayableContentImportParser {
  constructor(private readonly parserContainer: PlayableContentImportParserContainer) {}

  async parse(source: PlayableContentImportSource): Promise<PlayableImportItemDefinition[]> {
    const items = await this.parserContainer.parse(source);

    if (items.length === 0) {
      throw new Error(PlayableContentImportParserErrorCode.EMPTY_FILE);
    }

    return items.map((item) => this.toItemDefinition(item));
  }

  private toItemDefinition(item: RawImportItem): PlayableImportItemDefinition {
    const text = item.text.trim();

    if (text.length === 0) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    const normalizedOptions = item.options
      .map((option) => ({ ...option, text: option.text.trim() }))
      .filter((option) => option.text.length > 0);

    const kind =
      item.kind ?? this.inferKindFromOptionTexts(normalizedOptions.map((option) => option.text));

    if (normalizedOptions.length < 2) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    const options =
      kind === PlayableImportItemKind.TRUE_FALSE
        ? this.normalizeTrueFalseOptions(normalizedOptions)
        : normalizedOptions.map((option, index) => ({
            isCorrect: option.isCorrect,
            position: index,
            text: option.text,
          }));

    if (!options.some((option) => option.isCorrect)) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return {
      kind,
      options,
      points: item.points ?? DEFAULT_POINTS,
      text,
      timeLimit: item.timeLimit ?? DEFAULT_TIME_LIMIT,
    };
  }

  private normalizeTrueFalseOptions(
    options: readonly RawImportOption[],
  ): readonly SelectableOptionInput[] {
    const normalizedTexts = options.map((option) => option.text.toLowerCase());
    const trueIndex = normalizedTexts.indexOf('true');
    const falseIndex = normalizedTexts.indexOf('false');

    if (options.length !== 2 || trueIndex === -1 || falseIndex === -1) {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return TRUE_FALSE_OPTION_TEXTS.map((text, position) => ({
      isCorrect:
        options[text.toLowerCase() === 'true' ? trueIndex : falseIndex]?.isCorrect ?? false,
      position,
      text,
    }));
  }

  private inferKindFromOptionTexts(options: readonly string[]): PlayableImportItemKind {
    const normalized = options.map((option) => option.toLowerCase());

    return options.length === 2 && normalized.includes('true') && normalized.includes('false')
      ? PlayableImportItemKind.TRUE_FALSE
      : PlayableImportItemKind.MULTIPLE;
  }
}
