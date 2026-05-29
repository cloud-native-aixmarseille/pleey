import { Injectable } from '@nestjs/common';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionPromptCreationData } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import {
  PlayableContentImportParser,
  PlayableContentImportParserErrorCode,
} from '../../shared/services/playable-content-import/import-parser';
import type { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';

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

      if (error.message === PlayableContentImportParserErrorCode.EMPTY_FILE) {
        throw new Error(PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE);
      }

      if (error.message === PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT) {
        throw new Error(PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT);
      }

      if (error.message === PlayableContentImportParserErrorCode.INVALID_FILE) {
        throw new Error(PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE);
      }

      throw error;
    }
  }
}
