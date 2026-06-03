import { injectable } from 'inversify';
import {
  type PlayableItemEditorState,
  type PlayableItemKindConfig,
  resolvePlayableItemKindOption,
} from './playable-content-management-model';

export type PlayableManagementValidationIssueCode =
  | 'missingText'
  | 'missingOutcome'
  | 'missingCorrectOption'
  | 'invalidTimeLimit'
  | 'invalidPoints';

export interface PlayableManagementValidationIssue {
  readonly code: PlayableManagementValidationIssueCode;
}

const MINIMUM_OUTCOME_COUNT = 2;
const MINIMUM_TIME_LIMIT_SECONDS = 5;
const MINIMUM_POINTS = 0;

@injectable()
export class PlayableItemEditorValidator {
  validate(
    editorState: PlayableItemEditorState,
    itemKindConfig?: PlayableItemKindConfig,
  ): readonly PlayableManagementValidationIssue[] {
    const issues: PlayableManagementValidationIssue[] = [];
    const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);
    const hasFixedOptions = selectedKindOption?.fixedOptions !== undefined;

    if (editorState.text.trim().length === 0) {
      issues.push({ code: 'missingText' });
    }

    if (!hasFixedOptions) {
      const completeOutcomes = editorState.optionTexts.filter((option) => option.trim().length > 0);
      if (completeOutcomes.length < MINIMUM_OUTCOME_COUNT) {
        issues.push({ code: 'missingOutcome' });
      }

      const hasCorrectOutcome = editorState.optionTexts.some(
        (option, index) =>
          option.trim().length > 0 && editorState.correctPositions.includes(String(index)),
      );

      if (!hasCorrectOutcome) {
        issues.push({ code: 'missingCorrectOption' });
      }
    }

    if (
      selectedKindOption?.correctSelectionMode === 'single' &&
      editorState.correctPositions.length !== 1
    ) {
      issues.push({ code: 'missingCorrectOption' });
    }

    if (Number.parseInt(editorState.timeLimit, 10) < MINIMUM_TIME_LIMIT_SECONDS) {
      issues.push({ code: 'invalidTimeLimit' });
    }

    if (Number.parseInt(editorState.points, 10) < MINIMUM_POINTS) {
      issues.push({ code: 'invalidPoints' });
    }

    return issues;
  }

  isReady(editorState: PlayableItemEditorState, itemKindConfig?: PlayableItemKindConfig): boolean {
    return this.validate(editorState, itemKindConfig).length === 0;
  }
}
