import type { PlayableManagementItem } from '../../../../../../domains/game/types/shared/management/playable-management';
import {
  createPlayableItemEditorStateFromItem,
  type PlayableItemKindConfig,
} from '../playable-content-management-model';
import type { PlayableItemEditorValidator } from '../playable-item-editor-validator';

export function resolveStageTitle(item: PlayableManagementItem, fallback: string): string {
  const trimmed = item.text.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed.length > 44 ? `${trimmed.slice(0, 41)}...` : trimmed;
}

export function isStageReady(
  item: PlayableManagementItem,
  playableItemEditorValidator: PlayableItemEditorValidator,
  itemKindConfig?: PlayableItemKindConfig,
): boolean {
  return playableItemEditorValidator.isReady(
    createPlayableItemEditorStateFromItem(item, itemKindConfig),
    itemKindConfig,
  );
}
