import { PLAYABLE_CONTENT_LIMITS } from '@pleey/domain/game';
import { injectable } from 'inversify';
import {
  type PlayableItemEditorState,
  type PlayableItemKindConfig,
  resolvePlayableItemKindOption,
} from './playable-content-management-model';
import { playableMediaUploadPolicy } from './playable-media-upload-policy';

export type PlayableManagementValidationIssueCode =
  | 'missingText'
  | 'missingOutcome'
  | 'missingCorrectOption'
  | 'invalidTimeLimit'
  | 'invalidPoints'
  | 'unsupportedMediaType'
  | 'mediaTooLarge';

export interface PlayableManagementValidationIssue {
  readonly code: PlayableManagementValidationIssueCode;
}

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
      if (completeOutcomes.length < PLAYABLE_CONTENT_LIMITS.minOptions) {
        issues.push({ code: 'missingOutcome' });
      }

      const hasCorrectOutcome = editorState.optionTexts.some(
        (option, index) => option.trim().length > 0 && editorState.correctPositions.includes(String(index)),
      );

      if (!hasCorrectOutcome) {
        issues.push({ code: 'missingCorrectOption' });
      }
    }

    if (selectedKindOption?.correctSelectionMode === 'single' && editorState.correctPositions.length !== 1) {
      issues.push({ code: 'missingCorrectOption' });
    }

    if (Number.parseInt(editorState.timeLimit, 10) < PLAYABLE_CONTENT_LIMITS.minTimeLimitSeconds) {
      issues.push({ code: 'invalidTimeLimit' });
    }

    if (Number.parseInt(editorState.points, 10) < PLAYABLE_CONTENT_LIMITS.minPoints) {
      issues.push({ code: 'invalidPoints' });
    }

    if (editorState.mediaFile) {
      if (!playableMediaUploadPolicy.acceptedMimeTypes.some((mimeType) => mimeType === editorState.mediaFile?.type)) {
        issues.push({ code: 'unsupportedMediaType' });
      }

      if (editorState.mediaFile.size > playableMediaUploadPolicy.maxBytes) {
        issues.push({ code: 'mediaTooLarge' });
      }
    }

    return issues;
  }

  isReady(editorState: PlayableItemEditorState, itemKindConfig?: PlayableItemKindConfig): boolean {
    return this.validate(editorState, itemKindConfig).length === 0;
  }
}
