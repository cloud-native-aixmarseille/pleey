import { Injectable } from '@nestjs/common';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import {
  PredictionImportEmptyFileError,
  PredictionImportInvalidFileError,
  PredictionImportUnsupportedFormatError,
} from '../../../../../domain/game/types/prediction/errors';
import type { PredictionPromptCreationData } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import type { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import {
  PlayableContentImportParser,
  PlayableContentImportParserErrorCode,
} from '../../shared/services/playable-content-import/playable-content-import-parser';

@Injectable()
export class PredictionImportPromptMapper {
  constructor(
    private readonly parser: PlayableContentImportParser,
    private readonly optionPolicy: SelectableOptionPolicy,
  ) {}

  async map(source: PlayableContentImportSource): Promise<readonly PredictionPromptCreationData[]> {
    const importedItems = await this.parse(source);

    return importedItems.map((item) => {
      const options = this.optionPolicy.normalize(item.options);

      this.optionPolicy.assertMultipleChoiceOptions(options, {
        emptyOptionText: PredictionErrorCode.OPTION_TEXT_EMPTY,
        invalidCorrectOption: PredictionErrorCode.INVALID_CORRECT_OPTION,
      });

      return {
        options,
        points: item.points,
        promptText: item.text,
        timeLimit: item.timeLimit,
      };
    });
  }

  private async parse(source: PlayableContentImportSource) {
    try {
      return await this.parser.parse(source);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      const context = {
        fileName: source.fileName,
        parserErrorCode: error.message,
      };

      if (error.message === PlayableContentImportParserErrorCode.EMPTY_FILE) {
        throw new PredictionImportEmptyFileError(context);
      }

      if (error.message === PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT) {
        throw new PredictionImportUnsupportedFormatError(context);
      }

      if (error.message === PlayableContentImportParserErrorCode.INVALID_FILE) {
        throw new PredictionImportInvalidFileError(context);
      }

      throw error;
    }
  }
}
