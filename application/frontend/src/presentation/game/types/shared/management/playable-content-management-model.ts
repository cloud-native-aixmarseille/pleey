import type { ReactNode } from 'react';
import type { PlayableContentManagementGateway } from '../../../../../application/game/types/shared/contracts/playable-management.gateway';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableChoiceOption,
  PlayableManagementItem,
  PlayableManagementItemInput,
} from '../../../../../domains/game/types/shared/management/playable-management';
import { playableOutcomeEditorPolicy } from './playable-outcome-editor-policy';

type PlayableItemEditorKind = string | null;

interface PlayableItemKindFixedOption {
  readonly labelKey: string;
  readonly text: string | null;
}

interface PlayableItemKindOption<TKind extends string = string> {
  readonly correctSelectionMode: 'multiple' | 'single';
  readonly fixedOptions?: readonly PlayableItemKindFixedOption[];
  readonly labelKey: string;
  readonly value: TKind;
}

export interface PlayableItemKindConfig<TKind extends string = string> {
  readonly defaultKind: TKind;
  readonly options: readonly PlayableItemKindOption<TKind>[];
}

export interface PlayableContentManagementScreenProps {
  readonly gameTypeId: GameTypeId;
  readonly gateway: PlayableContentManagementGateway;
  readonly headerSupplement?: ReactNode;
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly translationRoot: string;
}

export interface ManagementGameTypeIdParser {
  parseOrNull(value: unknown): GameTypeId | null;
}

export interface PlayableItemEditorState {
  readonly id: number | null;
  readonly text: string;
  readonly kind: PlayableItemEditorKind;
  readonly timeLimit: string;
  readonly points: string;
  readonly correctPositions: readonly string[];
  readonly optionTexts: readonly string[];
}

const defaultOptionTexts = ['', '', '', '', '', '', '', ''];

function resolveDefaultEditorKind(
  itemKindConfig: PlayableItemKindConfig | undefined,
): PlayableItemEditorKind {
  return itemKindConfig?.defaultKind ?? null;
}

export function resolvePlayableItemKindOption(
  itemKindConfig: PlayableItemKindConfig | undefined,
  kind: PlayableItemEditorKind,
): PlayableItemKindOption | null {
  if (!itemKindConfig || kind === null) {
    return null;
  }

  return itemKindConfig.options.find((option) => option.value === kind) ?? null;
}

export function createEmptyPlayableItemEditorState(
  itemKindConfig?: PlayableItemKindConfig,
): PlayableItemEditorState {
  return {
    id: null,
    text: '',
    kind: resolveDefaultEditorKind(itemKindConfig),
    timeLimit: '20',
    points: '1000',
    correctPositions: ['0'],
    optionTexts: defaultOptionTexts,
  };
}

export function createPlayableItemEditorStateFromItem(
  item: PlayableManagementItem,
  itemKindConfig?: PlayableItemKindConfig,
): PlayableItemEditorState {
  const sortedOptions = [...item.options].sort((left, right) => left.position - right.position);
  const correctPositions = playableOutcomeEditorPolicy.normalizeCorrectPositions(
    sortedOptions.filter((option) => option.isCorrect).map((option) => String(option.position)),
  );

  return {
    id: item.id,
    text: item.text,
    kind: typeof item.kind === 'string' ? item.kind : resolveDefaultEditorKind(itemKindConfig),
    timeLimit: String(item.timeLimit),
    points: String(item.points),
    correctPositions: correctPositions.length > 0 ? correctPositions : ['0'],
    optionTexts: defaultOptionTexts.map(
      (_, index) => sortedOptions.find((option) => option.position === index)?.text ?? '',
    ),
  };
}

function toOptions(
  editorState: PlayableItemEditorState,
  itemKindConfig: PlayableItemKindConfig | undefined,
  t?: (key: string) => string,
): PlayableChoiceOption[] {
  const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);

  if (selectedKindOption?.fixedOptions) {
    return selectedKindOption.fixedOptions.map((option, position) => ({
      id: null,
      text: option.text ?? t?.(option.labelKey) ?? null,
      position,
      isCorrect: editorState.correctPositions.includes(String(position)),
    }));
  }

  return editorState.optionTexts
    .map((text, originalPosition) => ({ originalPosition, text: text.trim() }))
    .filter((option) => option.text.length > 0)
    .map((option, position) => ({
      id: null,
      text: option.text,
      position,
      isCorrect: editorState.correctPositions.includes(String(option.originalPosition)),
    }));
}

export function createPlayableItemInput(
  editorState: PlayableItemEditorState,
  itemKindConfig?: PlayableItemKindConfig,
  t?: (key: string) => string,
): PlayableManagementItemInput {
  return {
    text: editorState.text.trim(),
    kind: itemKindConfig ? (editorState.kind ?? itemKindConfig.defaultKind) : undefined,
    timeLimit: Number.parseInt(editorState.timeLimit, 10),
    points: Number.parseInt(editorState.points, 10),
    options: toOptions(editorState, itemKindConfig, t),
  };
}
