import type { Dispatch, DragEvent, SetStateAction } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import type {
  PlayableItemEditorState,
  PlayableItemKindConfig,
} from './playable-content-management-model';
import {
  type PlayableManagementDropPreview,
  playableManagementDragPlacement,
} from './playable-management-drag-placement';
import { playableOutcomeEditorPolicy } from './playable-outcome-editor-policy';

interface PlayableManagementOutcomesEditorProps {
  readonly canReorderOutcomes: boolean;
  readonly draggedOutcomeIndex: number | null;
  readonly dropPreview: PlayableManagementDropPreview | null;
  readonly editorState: PlayableItemEditorState;
  readonly fixedOptions: PlayableItemKindConfig['options'][number]['fixedOptions'] | undefined;
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly setDraggedOutcomeIndex: Dispatch<SetStateAction<number | null>>;
  readonly setDropPreview: Dispatch<SetStateAction<PlayableManagementDropPreview | null>>;
  readonly setEditorState: (editorState: PlayableItemEditorState) => void;
  readonly setVisibleOutcomeCount: Dispatch<SetStateAction<number>>;
  readonly translationRoot: string;
  readonly visibleOutcomeCount: number;
  readonly visibleOutcomeIndexes: readonly number[];
}

const outcomeActionsRowStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
} as const;

const outcomeDropZoneStyle = {
  display: 'grid',
  gap: '0.35rem',
} as const;

const dropIndicatorStyle = {
  background: uiThemeTokens.color.brand.primary,
  borderRadius: '999px',
  boxShadow: `0 0 0 4px color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 18%, transparent)`,
  height: '0.25rem',
  margin: '0.15rem 0',
} as const;

function createOutcomeBlockStyle(isCorrect: boolean, canReorder: boolean) {
  return {
    background: uiThemeTokens.color.surface.recessed,
    border: isCorrect
      ? `1px solid ${uiThemeTokens.color.brand.primary}`
      : `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: '1rem',
    cursor: canReorder ? 'grab' : 'default',
    padding: '1rem',
    touchAction: canReorder ? 'none' : 'auto',
  } as const;
}

export function PlayableManagementOutcomesEditor({
  canReorderOutcomes,
  draggedOutcomeIndex,
  dropPreview,
  editorState,
  fixedOptions,
  itemKindConfig,
  setDraggedOutcomeIndex,
  setDropPreview,
  setEditorState,
  setVisibleOutcomeCount,
  translationRoot,
  visibleOutcomeCount,
  visibleOutcomeIndexes,
}: PlayableManagementOutcomesEditorProps) {
  const { t } = usePresentationTranslation();

  const getOutcomeAriaLabel = (label: string) =>
    `${t(`${translationRoot}.correctOptionLabel`)}: ${label}`;

  return (
    <ContentStack gap="sm">
      {visibleOutcomeIndexes.map((index) => {
        const label = fixedOptions
          ? t(fixedOptions[index]?.labelKey ?? `${translationRoot}.optionLabel`)
          : t(`${translationRoot}.optionLabel`, { position: String(index + 1) });
        const isCorrect = editorState.correctPositions.includes(String(index));
        const isDragging = draggedOutcomeIndex === index;
        const isDropTarget = dropPreview?.hoveredIndex === index;
        const baseOutcomeStyle = createOutcomeBlockStyle(isCorrect, canReorderOutcomes);

        const handleOutcomeDrop = (event: DragEvent<HTMLDivElement>) => {
          if (!canReorderOutcomes) {
            return;
          }

          event.preventDefault();
          const fromIndex = Number(event.dataTransfer.getData('text/plain'));
          const edge = playableManagementDragPlacement.resolveDropEdge(event);
          const slot = playableManagementDragPlacement.resolveDisplaySlot(index, edge);

          setDraggedOutcomeIndex(null);
          setDropPreview(null);

          if (Number.isInteger(fromIndex) && fromIndex !== index) {
            const toIndex = playableManagementDragPlacement.resolveInsertionIndex(fromIndex, slot);

            if (toIndex !== fromIndex) {
              setEditorState(
                playableOutcomeEditorPolicy.moveOutcome(editorState, fromIndex, toIndex),
              );
            }
          }
        };

        return (
          <div
            draggable={canReorderOutcomes}
            key={index}
            onDragEnd={() => {
              setDraggedOutcomeIndex(null);
              setDropPreview(null);
            }}
            onDragLeave={(event) => {
              const relatedTarget = event.relatedTarget;

              if (
                !(relatedTarget instanceof Node) ||
                !event.currentTarget.contains(relatedTarget)
              ) {
                setDropPreview((current) => (current?.hoveredIndex === index ? null : current));
              }
            }}
            onDragOver={(event) => {
              if (canReorderOutcomes) {
                event.preventDefault();
                const edge = playableManagementDragPlacement.resolveDropEdge(event);
                setDropPreview({
                  hoveredIndex: index,
                  slot: playableManagementDragPlacement.resolveDisplaySlot(index, edge),
                });
              }
            }}
            onDragStart={(event) => {
              if (canReorderOutcomes) {
                setDraggedOutcomeIndex(index);
                event.dataTransfer.setData('text/plain', String(index));
                event.dataTransfer.effectAllowed = 'move';
              }
            }}
            onDrop={handleOutcomeDrop}
            style={outcomeDropZoneStyle}
          >
            {dropPreview?.slot === index ? <div style={dropIndicatorStyle} /> : null}
            <div
              style={{
                ...baseOutcomeStyle,
                background: isDropTarget
                  ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 6%, ${uiThemeTokens.color.surface.recessed})`
                  : baseOutcomeStyle.background,
                border: isDropTarget
                  ? `1px solid ${uiThemeTokens.color.border.accent}`
                  : baseOutcomeStyle.border,
                opacity: isDragging ? 0.45 : 1,
                transition: 'background 120ms ease, border-color 120ms ease, opacity 120ms ease',
              }}
            >
              <ContentStack gap="sm">
                <FieldShell id={`playable-item-option-${index}`} label={label}>
                  <Input
                    disabled={fixedOptions !== undefined}
                    id={`playable-item-option-${index}`}
                    onChange={(event) =>
                      setEditorState({
                        ...editorState,
                        optionTexts: playableOutcomeEditorPolicy.replaceOption(
                          editorState.optionTexts,
                          index,
                          event.target.value,
                        ),
                      })
                    }
                    value={fixedOptions ? label : (editorState.optionTexts[index] ?? '')}
                  />
                </FieldShell>
                <div style={outcomeActionsRowStyle}>
                  {canReorderOutcomes ? <AppIcon name="grip-vertical" size={16} /> : null}
                  <Button
                    aria-label={getOutcomeAriaLabel(label)}
                    intent={isCorrect ? 'primary' : 'ghost'}
                    onClick={() =>
                      setEditorState(
                        playableOutcomeEditorPolicy.toggleCorrectPosition(
                          editorState,
                          index,
                          itemKindConfig,
                        ),
                      )
                    }
                    size="sm"
                  >
                    {t(`${translationRoot}.correctOptionLabel`)}
                  </Button>
                  {visibleOutcomeCount > 2 && fixedOptions === undefined ? (
                    <Button
                      disabled={index === 0}
                      intent="ghost"
                      leftSection={<AppIcon name="arrow-up" size={14} />}
                      onClick={() =>
                        setEditorState(
                          playableOutcomeEditorPolicy.moveOutcome(editorState, index, index - 1),
                        )
                      }
                      size="sm"
                    >
                      {t(`${translationRoot}.moveItemUpShort`)}
                    </Button>
                  ) : null}
                  {visibleOutcomeCount > 2 && fixedOptions === undefined ? (
                    <Button
                      disabled={index >= visibleOutcomeCount - 1}
                      intent="ghost"
                      leftSection={<AppIcon name="arrow-down" size={14} />}
                      onClick={() =>
                        setEditorState(
                          playableOutcomeEditorPolicy.moveOutcome(editorState, index, index + 1),
                        )
                      }
                      size="sm"
                    >
                      {t(`${translationRoot}.moveItemDownShort`)}
                    </Button>
                  ) : null}
                  {visibleOutcomeCount > 2 && fixedOptions === undefined ? (
                    <Button
                      intent="ghost"
                      leftSection={<AppIcon name="trash" size={14} />}
                      onClick={() => {
                        const nextState = playableOutcomeEditorPolicy.removeOutcome(
                          editorState,
                          index,
                          visibleOutcomeCount,
                        );
                        setEditorState(nextState.editorState);
                        setVisibleOutcomeCount(nextState.visibleOutcomeCount);
                      }}
                      size="sm"
                    >
                      {t(`${translationRoot}.removeOutcomeShort`)}
                    </Button>
                  ) : null}
                </div>
              </ContentStack>
            </div>
          </div>
        );
      })}
      {dropPreview?.slot === visibleOutcomeIndexes.length ? (
        <div aria-hidden="true" style={dropIndicatorStyle} />
      ) : null}
    </ContentStack>
  );
}
