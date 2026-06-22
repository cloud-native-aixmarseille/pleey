import { type ComponentProps, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { PlayableManagementItem } from '../../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { InteractiveSurfaceButton } from '../../../../../shared/ui/actions/interactive-surface-button';
import { ReorderDropIndicator } from '../../../../../shared/ui/actions/reorder-drop-indicator';
import { ReorderHandle } from '../../../../../shared/ui/actions/reorder-handle';
import { InlineStatPill } from '../../../../../shared/ui/data/inline-stat-pill';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ActionRow, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SummaryText } from '../../../../../shared/ui/layout/typography';
import type { PlayableItemKindConfig } from '../playable-content-management-model';
import type { PlayableItemEditorValidator } from '../playable-item-editor-validator';
import { type PlayableManagementDropPreview } from '../playable-management-drag-placement';
import { PlayableManagementIconActionButton } from '../playable-management-icon-action-button';
import { createPlayableManagementReorderBindings } from '../playable-management-reorder-bindings';
import { isStageReady, resolveStageTitle } from './stage-rail-helpers';
import {
  createItemCardStyle,
  itemButtonContentStyle,
  itemSelectButtonStyle,
} from './stage-rail-styles';

type StageRailIconName = ComponentProps<typeof AppIcon>['name'];

interface StageRailMetaStatProps {
  readonly iconName: StageRailIconName;
  readonly children: ReactNode;
}

function StageRailMetaStat({ children, iconName }: StageRailMetaStatProps) {
  return <InlineStatPill icon={<AppIcon name={iconName} size={14} />}>{children}</InlineStatPill>;
}

interface PlayableManagementStageRailItemProps {
  readonly draggedIndex: number | null;
  readonly dropPreview: PlayableManagementDropPreview | null;
  readonly hoveredHandleIndex: number | null;
  readonly index: number;
  readonly item: PlayableManagementItem;
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly itemsLength: number;
  readonly onDeleteItem: (item: PlayableManagementItem) => void;
  readonly onMoveItem: (fromIndex: number, toIndex: number) => void;
  readonly onSelectItem: (item: PlayableManagementItem) => void;
  readonly playableItemEditorValidator: PlayableItemEditorValidator;
  readonly selectedItemId: string | null;
  readonly setDraggedIndex: Dispatch<SetStateAction<number | null>>;
  readonly setDropPreview: Dispatch<SetStateAction<PlayableManagementDropPreview | null>>;
  readonly setHoveredHandleIndex: Dispatch<SetStateAction<number | null>>;
  readonly translationRoot: string;
}

export function PlayableManagementStageRailItem({
  draggedIndex,
  dropPreview,
  hoveredHandleIndex,
  index,
  item,
  itemKindConfig,
  itemsLength,
  onDeleteItem,
  onMoveItem,
  onSelectItem,
  playableItemEditorValidator,
  selectedItemId,
  setDraggedIndex,
  setDropPreview,
  setHoveredHandleIndex,
  translationRoot,
}: PlayableManagementStageRailItemProps) {
  const { t } = usePresentationTranslation();
  const selected = item.id === selectedItemId;
  const ready = isStageReady(item, playableItemEditorValidator, itemKindConfig);
  const reorderBindings = createPlayableManagementReorderBindings<HTMLLIElement>({
    draggedIndex,
    dropPreview,
    index,
    moveItem: onMoveItem,
    setDraggedIndex,
    setDropPreview,
  });

  return (
    <li
      draggable={reorderBindings.draggable}
      onDragEnd={reorderBindings.onDragEnd}
      onDragLeave={reorderBindings.onDragLeave}
      onDragOver={reorderBindings.onDragOver}
      onDragStart={reorderBindings.onDragStart}
      onDrop={reorderBindings.onDrop}
    >
      {dropPreview?.slot === index ? <ReorderDropIndicator /> : null}
      <div
        style={createItemCardStyle(
          selected,
          reorderBindings.isDragging,
          reorderBindings.isDropTarget,
        )}
      >
        <InteractiveSurfaceButton
          aria-current={selected ? 'true' : undefined}
          onClick={() => onSelectItem(item)}
          surfaceStyle={itemSelectButtonStyle}
        >
          <div style={itemButtonContentStyle}>
            <SummaryText>
              {resolveStageTitle(item, t(`${translationRoot}.itemUntitled`))}
            </SummaryText>
            <WrapRow gap="sm">
              <Badge tone={ready ? 'success' : 'warning'}>
                {ready ? t(`${translationRoot}.ready`) : t(`${translationRoot}.incomplete`)}
              </Badge>
              <StageRailMetaStat iconName="trophy">{String(item.points)}</StageRailMetaStat>
              <StageRailMetaStat iconName="pending">
                {t(`${translationRoot}.itemTimeLimitShort`, {
                  seconds: String(item.timeLimit),
                })}
              </StageRailMetaStat>
              <StageRailMetaStat iconName="quiz">{String(item.options.length)}</StageRailMetaStat>
            </WrapRow>
          </div>
        </InteractiveSurfaceButton>
        <SplitWrapRow gap="md">
          <ReorderHandle
            active={hoveredHandleIndex === index}
            dragging={reorderBindings.isDragging}
            onMouseEnter={() => setHoveredHandleIndex(index)}
            onMouseLeave={() =>
              setHoveredHandleIndex((current) => (current === index ? null : current))
            }
          />
          <ActionRow justify="end">
            <PlayableManagementIconActionButton
              disabled={index === 0}
              iconName="arrow-up"
              label={t(`${translationRoot}.moveItemUpShort`)}
              onClick={() => onMoveItem(index, index - 1)}
              stopPropagation
              tooltipLabel={t(`${translationRoot}.moveItemUp`)}
            />
            <PlayableManagementIconActionButton
              disabled={index >= itemsLength - 1}
              iconName="arrow-down"
              label={t(`${translationRoot}.moveItemDownShort`)}
              onClick={() => onMoveItem(index, index + 1)}
              stopPropagation
              tooltipLabel={t(`${translationRoot}.moveItemDown`)}
            />
            <PlayableManagementIconActionButton
              iconName="trash"
              label={t(`${translationRoot}.deleteItemShort`)}
              onClick={() => onDeleteItem(item)}
              stopPropagation
              tooltipLabel={t(`${translationRoot}.deleteItem`)}
            />
          </ActionRow>
        </SplitWrapRow>
      </div>
    </li>
  );
}
