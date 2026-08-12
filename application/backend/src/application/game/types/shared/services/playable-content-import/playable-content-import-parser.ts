import { Injectable } from '@nestjs/common';
import type { SelectableOptionInput } from '../../../../../../domain/game/types/shared/entities/selectable-option';
import {
  PlayableContentImportEmptyFileError,
  PlayableContentImportInvalidFileError,
} from '../../../../../../domain/game/types/shared/errors/import-parser.error';
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

export {
  PlayableContentImportInvalidFileError,
  PlayableContentImportParserErrorCode,
} from '../../../../../../domain/game/types/shared/errors/import-parser.error';

@Injectable()
export class PlayableContentImportParser {
  constructor(private readonly parserContainer: PlayableContentImportParserContainer) {}

  async parse(source: PlayableContentImportSource): Promise<PlayableImportItemDefinition[]> {
    const items = await this.parserContainer.parse(source);

    if (items.length === 0) {
      throw new PlayableContentImportEmptyFileError({ fileName: source.fileName });
    }

    return items.map((item, itemIndex) => this.toItemDefinition(item, source.fileName, itemIndex));
  }

  private toItemDefinition(item: RawImportItem, fileName: string, itemIndex: number): PlayableImportItemDefinition {
    const text = item.text.trim();

    if (text.length === 0) {
      throw new PlayableContentImportInvalidFileError({
        fileName,
        itemIndex,
        reason: 'itemTextEmpty',
      });
    }

    const normalizedOptions = item.options
      .map((option) => ({ ...option, text: option.text.trim() }))
      .filter((option) => option.text.length > 0);

    const kind = item.kind ?? this.inferKindFromOptionTexts(normalizedOptions.map((option) => option.text));

    if (normalizedOptions.length < 2) {
      throw new PlayableContentImportInvalidFileError({
        fileName,
        itemIndex,
        optionCount: normalizedOptions.length,
        reason: 'insufficientOptions',
      });
    }

    const options =
      kind === PlayableImportItemKind.TRUE_FALSE
        ? this.normalizeTrueFalseOptions(normalizedOptions, fileName, itemIndex)
        : normalizedOptions.map((option, index) => ({
            isCorrect: option.isCorrect,
            position: index,
            text: option.text,
          }));

    if (!options.some((option) => option.isCorrect)) {
      throw new PlayableContentImportInvalidFileError({
        fileName,
        itemIndex,
        reason: 'missingCorrectOption',
      });
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
    fileName: string,
    itemIndex: number,
  ): readonly SelectableOptionInput[] {
    const normalizedTexts = options.map((option) => option.text.toLowerCase());
    const trueIndex = normalizedTexts.indexOf('true');
    const falseIndex = normalizedTexts.indexOf('false');

    if (options.length !== 2 || trueIndex === -1 || falseIndex === -1) {
      throw new PlayableContentImportInvalidFileError({
        fileName,
        itemIndex,
        optionTexts: options.map((option) => option.text),
        reason: 'invalidTrueFalseOptions',
      });
    }

    return TRUE_FALSE_OPTION_TEXTS.map((text, position) => ({
      isCorrect: options[text.toLowerCase() === 'true' ? trueIndex : falseIndex]?.isCorrect ?? false,
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
