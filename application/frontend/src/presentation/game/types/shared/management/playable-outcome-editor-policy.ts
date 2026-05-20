import {
  type PlayableItemEditorState,
  type PlayableItemKindConfig,
  resolvePlayableItemKindOption,
} from './playable-content-management-model';

export const MAX_PLAYABLE_OUTCOME_COUNT = 8;

interface RemovePlayableOutcomeResult {
  readonly editorState: PlayableItemEditorState;
  readonly visibleOutcomeCount: number;
}

interface PlayableOutcomeEditorPolicy {
  resolveInitialOutcomeCount(
    editorState: PlayableItemEditorState,
    itemKindConfig?: PlayableItemKindConfig,
  ): number;
  replaceOption(options: readonly string[], index: number, value: string): readonly string[];
  normalizeCorrectPositions(correctPositions: readonly string[]): readonly string[];
  toggleCorrectPosition(
    editorState: PlayableItemEditorState,
    index: number,
    itemKindConfig?: PlayableItemKindConfig,
  ): PlayableItemEditorState;
  moveOutcome(
    editorState: PlayableItemEditorState,
    fromIndex: number,
    toIndex: number,
  ): PlayableItemEditorState;
  removeOutcome(
    editorState: PlayableItemEditorState,
    index: number,
    visibleOutcomeCount: number,
  ): RemovePlayableOutcomeResult;
}

function moveOption(
  options: readonly string[],
  fromIndex: number,
  toIndex: number,
): readonly string[] {
  const next = [...options];
  const moved = next[fromIndex];

  if (moved === undefined) {
    return options;
  }

  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next;
}

function remapCorrectPosition(correctPosition: string, fromIndex: number, toIndex: number): string {
  const currentIndex = Number.parseInt(correctPosition, 10);

  if (Number.isNaN(currentIndex) || fromIndex === toIndex) {
    return correctPosition;
  }

  if (currentIndex === fromIndex) {
    return String(toIndex);
  }

  if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
    return String(currentIndex - 1);
  }

  if (fromIndex > toIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
    return String(currentIndex + 1);
  }

  return correctPosition;
}

export const playableOutcomeEditorPolicy: PlayableOutcomeEditorPolicy = {
  resolveInitialOutcomeCount(
    editorState: PlayableItemEditorState,
    itemKindConfig?: PlayableItemKindConfig,
  ): number {
    const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);

    if (selectedKindOption?.fixedOptions) {
      return selectedKindOption.fixedOptions.length;
    }

    const lastFilledIndex = editorState.optionTexts.reduce(
      (lastIndex, option, index) => (option.trim().length > 0 ? index : lastIndex),
      1,
    );

    return Math.min(MAX_PLAYABLE_OUTCOME_COUNT, Math.max(2, lastFilledIndex + 1));
  },

  replaceOption(options: readonly string[], index: number, value: string): readonly string[] {
    return options.map((option, optionIndex) => (optionIndex === index ? value : option));
  },

  normalizeCorrectPositions(correctPositions: readonly string[]): readonly string[] {
    return [...new Set(correctPositions)]
      .map((position) => Number.parseInt(position, 10))
      .filter((position) => Number.isInteger(position) && position >= 0)
      .sort((left, right) => left - right)
      .map(String);
  },

  toggleCorrectPosition(
    editorState: PlayableItemEditorState,
    index: number,
    itemKindConfig?: PlayableItemKindConfig,
  ): PlayableItemEditorState {
    const nextPosition = String(index);
    const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);

    if (selectedKindOption?.correctSelectionMode === 'single') {
      return {
        ...editorState,
        correctPositions: [nextPosition],
      };
    }

    return {
      ...editorState,
      correctPositions: playableOutcomeEditorPolicy.normalizeCorrectPositions(
        editorState.correctPositions.includes(nextPosition)
          ? editorState.correctPositions.filter(
              (correctPosition) => correctPosition !== nextPosition,
            )
          : [...editorState.correctPositions, nextPosition],
      ),
    };
  },

  moveOutcome(
    editorState: PlayableItemEditorState,
    fromIndex: number,
    toIndex: number,
  ): PlayableItemEditorState {
    return {
      ...editorState,
      correctPositions: playableOutcomeEditorPolicy.normalizeCorrectPositions(
        editorState.correctPositions.map((correctPosition) =>
          remapCorrectPosition(correctPosition, fromIndex, toIndex),
        ),
      ),
      optionTexts: moveOption(editorState.optionTexts, fromIndex, toIndex),
    };
  },

  removeOutcome(
    editorState: PlayableItemEditorState,
    index: number,
    visibleOutcomeCount: number,
  ): RemovePlayableOutcomeResult {
    const nextVisibleOutcomeCount =
      index === visibleOutcomeCount - 1
        ? Math.max(2, visibleOutcomeCount - 1)
        : visibleOutcomeCount;

    return {
      editorState: {
        ...editorState,
        correctPositions: editorState.correctPositions.filter(
          (correctPosition) => correctPosition !== String(index),
        ),
        optionTexts: playableOutcomeEditorPolicy.replaceOption(editorState.optionTexts, index, ''),
      },
      visibleOutcomeCount: nextVisibleOutcomeCount,
    };
  },
};
