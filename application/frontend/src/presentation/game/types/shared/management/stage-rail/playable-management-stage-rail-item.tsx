import { type Dispatch, type DragEvent, type SetStateAction } from 'react';
import type { PlayableManagementItem } from '../../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ActionRow } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { Tooltip } from '../../../../../shared/ui/overlay/tooltip';
import type { PlayableItemKindConfig } from '../playable-content-management-model';
import type { PlayableItemEditorValidator } from '../playable-item-editor-validator';
import {
  type PlayableManagementDropPreview,
  playableManagementDragPlacement,
} from '../playable-management-drag-placement';
import { isStageReady, resolveStageTitle } from './stage-rail-helpers';
import {
  createDragHandleStyle,
  createItemCardStyle,
  dropIndicatorStyle,
  itemActionRowStyle,
  itemMetaRowStyle,
  itemMetaStatStyle,
  itemSelectButtonStyle,
  itemTitleStyle,
} from './stage-rail-styles';

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
  const isDragging = draggedIndex === index;
  const isDropTarget = dropPreview?.hoveredIndex === index;

  return (
    <li
      draggable
      onDragEnd={() => {
        setDraggedIndex(null);
        setDropPreview(null);
      }}
      onDragLeave={(event: DragEvent<HTMLLIElement>) => {
        const relatedTarget = event.relatedTarget;

        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
          setDropPreview((current) => (current?.hoveredIndex === index ? null : current));
        }
      }}
      onDragOver={(event: DragEvent<HTMLLIElement>) => {
        event.preventDefault();
        const edge = playableManagementDragPlacement.resolveDropEdge(event);
        setDropPreview({
          hoveredIndex: index,
          slot: playableManagementDragPlacement.resolveDisplaySlot(index, edge),
        });
      }}
      onDragStart={(event: DragEvent<HTMLLIElement>) => {
        setDraggedIndex(index);
        event.dataTransfer.setData('text/plain', String(index));
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDrop={(event: DragEvent<HTMLLIElement>) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData('text/plain'));
        const edge = playableManagementDragPlacement.resolveDropEdge(event);
        const slot = playableManagementDragPlacement.resolveDisplaySlot(index, edge);

        setDraggedIndex(null);
        setDropPreview(null);

        if (Number.isInteger(fromIndex)) {
          const toIndex = playableManagementDragPlacement.resolveInsertionIndex(fromIndex, slot);

          if (toIndex !== fromIndex) {
            onMoveItem(fromIndex, toIndex);
          }
        }
      }}
    >
      {dropPreview?.slot === index ? <div style={dropIndicatorStyle} /> : null}
      <div style={createItemCardStyle(selected, isDragging, isDropTarget)}>
        <Button
          aria-current={selected ? 'true' : undefined}
          intent="ghost"
          labelStyle={{
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: 'minmax(0, 1fr)',
            lineHeight: 1.35,
            overflow: 'visible',
            textAlign: 'left',
            whiteSpace: 'normal',
            width: '100%',
            wordBreak: 'break-word',
          }}
          onClick={() => onSelectItem(item)}
          rootStyle={itemSelectButtonStyle}
          size="sm"
          type="button"
        >
          <span style={itemTitleStyle}>
            {resolveStageTitle(item, t(`${translationRoot}.itemUntitled`))}
          </span>
          <div style={itemMetaRowStyle}>
            <Badge tone={ready ? 'success' : 'warning'}>
              {ready ? t(`${translationRoot}.ready`) : t(`${translationRoot}.incomplete`)}
            </Badge>
            <div style={itemMetaStatStyle}>
              <AppIcon name="trophy" size={14} />
              <SupportingText>{String(item.points)}</SupportingText>
            </div>
            <div style={itemMetaStatStyle}>
              <AppIcon name="pending" size={14} />
              <SupportingText>
                {t(`${translationRoot}.itemTimeLimitShort`, {
                  seconds: String(item.timeLimit),
                })}
              </SupportingText>
            </div>
            <div style={itemMetaStatStyle}>
              <AppIcon name="quiz" size={14} />
              <SupportingText>{String(item.options.length)}</SupportingText>
            </div>
          </div>
        </Button>
        <div style={itemActionRowStyle}>
          <div
            onMouseEnter={() => setHoveredHandleIndex(index)}
            onMouseLeave={() =>
              setHoveredHandleIndex((current) => (current === index ? null : current))
            }
            style={createDragHandleStyle(hoveredHandleIndex === index, isDragging)}
          >
            <AppIcon name="grip-vertical" size={16} />
          </div>
          <ActionRow justify="end">
            <Tooltip label={t(`${translationRoot}.moveItemUp`)}>
              <span>
                <Button
                  disabled={index === 0}
                  intent="ghost"
                  leftSection={<AppIcon name="arrow-up" size={14} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveItem(index, index - 1);
                  }}
                  size="sm"
                >
                  {t(`${translationRoot}.moveItemUpShort`)}
                </Button>
              </span>
            </Tooltip>
            <Tooltip label={t(`${translationRoot}.moveItemDown`)}>
              <span>
                <Button
                  disabled={index >= itemsLength - 1}
                  intent="ghost"
                  leftSection={<AppIcon name="arrow-down" size={14} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveItem(index, index + 1);
                  }}
                  size="sm"
                >
                  {t(`${translationRoot}.moveItemDownShort`)}
                </Button>
              </span>
            </Tooltip>
            <Tooltip label={t(`${translationRoot}.deleteItem`)}>
              <span>
                <Button
                  intent="ghost"
                  leftSection={<AppIcon name="trash" size={14} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteItem(item);
                  }}
                  size="sm"
                >
                  {t(`${translationRoot}.deleteItemShort`)}
                </Button>
              </span>
            </Tooltip>
          </ActionRow>
        </div>
      </div>
    </li>
  );
}
