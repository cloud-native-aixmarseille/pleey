import { type DragEvent, useState } from 'react';
import type { PlayableManagementItem } from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { Badge } from '../../../../shared/ui/feedback/badge';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, SplitWrapRow } from '../../../../shared/ui/layout/containers';
import { DashedNoticePanel, ElevatedPanel } from '../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../shared/ui/layout/typography';
import { Tooltip } from '../../../../shared/ui/overlay/tooltip';
import { useWorkspaceDependencies } from '../../../../workspace/shared/contexts/workspace-dependencies-context';
import {
  createPlayableItemEditorStateFromItem,
  type PlayableItemKindConfig,
} from './playable-content-management-model';
import type { PlayableItemEditorValidator } from './playable-item-editor-validator';
import {
  type PlayableManagementDropPreview,
  playableManagementDragPlacement,
} from './playable-management-drag-placement';

interface PlayableManagementStageRailProps {
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly items: readonly PlayableManagementItem[];
  readonly selectedItemId: string | null;
  readonly translationRoot: string;
  readonly onAddItem: () => void;
  readonly onDeleteItem: (item: PlayableManagementItem) => void;
  readonly onMoveItem: (fromIndex: number, toIndex: number) => void;
  readonly onSelectItem: (item: PlayableManagementItem) => void;
}

const listStyle = {
  display: 'grid',
  gap: '0.75rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
} as const;

const dropIndicatorStyle = {
  background: uiThemeTokens.color.brand.primary,
  borderRadius: '999px',
  boxShadow: `0 0 0 4px color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 18%, transparent)`,
  height: '0.25rem',
  margin: '0.2rem 0',
} as const;

const createItemCardStyle = (selected: boolean, isDragging: boolean, isDropTarget: boolean) =>
  ({
    background: isDropTarget
      ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, ${uiThemeTokens.color.surface.recessed})`
      : selected
        ? uiThemeTokens.color.surface.accentMuted
        : 'transparent',
    border: isDropTarget
      ? `1px solid ${uiThemeTokens.color.border.accent}`
      : selected
        ? `1px solid ${uiThemeTokens.color.brand.primary}`
        : `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: '1rem',
    color: 'inherit',
    cursor: isDragging ? 'grabbing' : 'pointer',
    display: 'grid',
    gap: '0.5rem',
    opacity: isDragging ? 0.55 : 1,
    padding: '0.9rem',
    transform: isDropTarget ? 'scale(1.01)' : 'scale(1)',
    transition:
      'background 120ms ease, border-color 120ms ease, opacity 120ms ease, transform 120ms ease',
    width: '100%',
  }) as const;

const itemSelectButtonStyle = {
  background: 'transparent',
  border: 0,
  color: 'inherit',
  cursor: 'pointer',
  display: 'grid',
  gap: '0.5rem',
  padding: 0,
  textAlign: 'left',
  width: '100%',
} as const;

const itemMetaRowStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
} as const;

const itemMetaStatStyle = {
  alignItems: 'center',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: '999px',
  display: 'flex',
  gap: '0.35rem',
  padding: '0.2rem 0.55rem',
} as const;

const itemActionRowStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
} as const;

const createDragHandleStyle = (isHovering: boolean, isDragging: boolean) =>
  ({
    alignItems: 'center',
    background: isHovering
      ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, transparent)`
      : 'transparent',
    border: isHovering
      ? `1px solid color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 55%, transparent)`
      : '1px solid transparent',
    borderRadius: '0.85rem',
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.35rem 0.55rem',
    touchAction: 'none',
    transition: 'background 120ms ease, border-color 120ms ease',
  }) as const;

function resolveStageTitle(item: PlayableManagementItem, fallback: string): string {
  const trimmed = item.text.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed.length > 44 ? `${trimmed.slice(0, 41)}...` : trimmed;
}

function isStageReady(
  item: PlayableManagementItem,
  playableItemEditorValidator: PlayableItemEditorValidator,
  itemKindConfig?: PlayableItemKindConfig,
): boolean {
  return playableItemEditorValidator.isReady(
    createPlayableItemEditorStateFromItem(item, itemKindConfig),
    itemKindConfig,
  );
}

export function PlayableManagementStageRail({
  itemKindConfig,
  items,
  onAddItem,
  onDeleteItem,
  onMoveItem,
  onSelectItem,
  selectedItemId,
  translationRoot,
}: PlayableManagementStageRailProps) {
  const { t } = usePresentationTranslation();
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropPreview, setDropPreview] = useState<PlayableManagementDropPreview | null>(null);
  const [hoveredHandleIndex, setHoveredHandleIndex] = useState<number | null>(null);

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="md">
        <SplitWrapRow>
          <Heading level={2}>{t(`${translationRoot}.itemsTitle`)}</Heading>
          <Button leftSection={<AppIcon name="plus" size={14} />} onClick={onAddItem} size="sm">
            {t(`${translationRoot}.createItem`)}
          </Button>
        </SplitWrapRow>

        {items.length === 0 ? (
          <DashedNoticePanel>{t(`${translationRoot}.empty`)}</DashedNoticePanel>
        ) : (
          <ol aria-label={t(`${translationRoot}.itemsTitle`)} style={listStyle}>
            {items.map((item, index) => {
              const selected = item.id === selectedItemId;
              const ready = isStageReady(item, playableItemEditorValidator, itemKindConfig);
              const isDragging = draggedIndex === index;
              const isDropTarget = dropPreview?.hoveredIndex === index;

              return (
                <li
                  draggable
                  key={item.id}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDropPreview(null);
                  }}
                  onDragLeave={(event: DragEvent<HTMLLIElement>) => {
                    const relatedTarget = event.relatedTarget;

                    if (
                      !(relatedTarget instanceof Node) ||
                      !event.currentTarget.contains(relatedTarget)
                    ) {
                      setDropPreview((current) =>
                        current?.hoveredIndex === index ? null : current,
                      );
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
                      const toIndex = playableManagementDragPlacement.resolveInsertionIndex(
                        fromIndex,
                        slot,
                      );

                      if (toIndex !== fromIndex) {
                        onMoveItem(fromIndex, toIndex);
                      }
                    }
                  }}
                >
                  {dropPreview?.slot === index ? <div style={dropIndicatorStyle} /> : null}
                  <div style={createItemCardStyle(selected, isDragging, isDropTarget)}>
                    <button
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => onSelectItem(item)}
                      style={itemSelectButtonStyle}
                      type="button"
                    >
                      <strong>
                        {resolveStageTitle(item, t(`${translationRoot}.itemUntitled`))}
                      </strong>
                      <div style={itemMetaRowStyle}>
                        <Badge tone={ready ? 'success' : 'warning'}>
                          {ready
                            ? t(`${translationRoot}.ready`)
                            : t(`${translationRoot}.incomplete`)}
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
                    </button>
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
                              disabled={index >= items.length - 1}
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
            })}
            {dropPreview?.slot === items.length ? (
              <li aria-hidden="true">
                <div style={dropIndicatorStyle} />
              </li>
            ) : null}
          </ol>
        )}
      </ContentStack>
    </ElevatedPanel>
  );
}
