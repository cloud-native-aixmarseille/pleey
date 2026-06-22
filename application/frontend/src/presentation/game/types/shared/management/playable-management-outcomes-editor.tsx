import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { ReorderDropIndicator } from '../../../../shared/ui/actions/reorder-drop-indicator';
import { ReorderHandle } from '../../../../shared/ui/actions/reorder-handle';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { ActionRow, ContentStack } from '../../../../shared/ui/layout/containers';
import { ConfirmDialog } from '../../../../shared/ui/overlay/confirm-dialog';
import { useConfirmDialog } from '../../../../shared/ui/overlay/use-confirm-dialog';
import type {
  PlayableItemEditorState,
  PlayableItemKindConfig,
} from './playable-content-management-model';
import { type PlayableManagementDropPreview } from './playable-management-drag-placement';
import { PlayableManagementIconActionButton } from './playable-management-icon-action-button';
import {
  createOutcomeBlockStyle,
  outcomeDropZoneStyle,
} from './playable-management-outcomes-editor.styles';
import { createPlayableManagementReorderBindings } from './playable-management-reorder-bindings';
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

interface PendingOutcomeRemoval {
  readonly index: number;
  readonly label: string;
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
  const confirmDialog = useConfirmDialog();
  const [pendingOutcomeRemoval, setPendingOutcomeRemoval] = useState<PendingOutcomeRemoval | null>(
    null,
  );

  const getOutcomeAriaLabel = (label: string) =>
    `${t(`${translationRoot}.correctOptionLabel`)}: ${label}`;

  const requestOutcomeRemoval = (index: number, label: string) => {
    setPendingOutcomeRemoval({ index, label });

    void confirmDialog
      .requestConfirmation(
        t(`${translationRoot}.removeOutcomeConfirmMessage`, {
          text: label,
        }),
      )
      .then((confirmed) => {
        if (confirmed) {
          const nextState = playableOutcomeEditorPolicy.removeOutcome(
            editorState,
            index,
            visibleOutcomeCount,
          );
          setEditorState(nextState.editorState);
          setVisibleOutcomeCount(nextState.visibleOutcomeCount);
        }

        setPendingOutcomeRemoval(null);
      });
  };

  return (
    <>
      <ContentStack gap="sm">
        {visibleOutcomeIndexes.map((index) => {
          const label = fixedOptions
            ? t(fixedOptions[index]?.labelKey ?? `${translationRoot}.optionLabel`)
            : t(`${translationRoot}.optionLabel`, { position: String(index + 1) });
          const isCorrect = editorState.correctPositions.includes(String(index));
          const reorderBindings = createPlayableManagementReorderBindings<HTMLDivElement>({
            draggedIndex: draggedOutcomeIndex,
            dropPreview,
            enabled: canReorderOutcomes,
            index,
            moveItem: (fromIndex, toIndex) => {
              setEditorState(
                playableOutcomeEditorPolicy.moveOutcome(editorState, fromIndex, toIndex),
              );
            },
            setDraggedIndex: setDraggedOutcomeIndex,
            setDropPreview,
          });
          const baseOutcomeStyle = createOutcomeBlockStyle(isCorrect, canReorderOutcomes);

          return (
            <div
              draggable={reorderBindings.draggable}
              key={index}
              onDragEnd={reorderBindings.onDragEnd}
              onDragLeave={reorderBindings.onDragLeave}
              onDragOver={reorderBindings.onDragOver}
              onDragStart={reorderBindings.onDragStart}
              onDrop={reorderBindings.onDrop}
              style={outcomeDropZoneStyle}
            >
              {dropPreview?.slot === index ? <ReorderDropIndicator compact /> : null}
              <div
                style={{
                  ...baseOutcomeStyle,
                  background: reorderBindings.isDropTarget
                    ? 'color-mix(in srgb, var(--ui-color-brand-primary) 6%, var(--ui-color-surface-recessed))'
                    : baseOutcomeStyle.background,
                  border: reorderBindings.isDropTarget
                    ? '1px solid var(--ui-color-border-accent)'
                    : baseOutcomeStyle.border,
                  opacity: reorderBindings.isDragging ? 0.45 : 1,
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
                  <ActionRow gap="xs">
                    {canReorderOutcomes ? (
                      <ReorderHandle dragging={reorderBindings.isDragging} />
                    ) : null}
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
                      <PlayableManagementIconActionButton
                        disabled={index === 0}
                        iconName="arrow-up"
                        label={t(`${translationRoot}.moveItemUpShort`)}
                        onClick={() =>
                          setEditorState(
                            playableOutcomeEditorPolicy.moveOutcome(editorState, index, index - 1),
                          )
                        }
                      />
                    ) : null}
                    {visibleOutcomeCount > 2 && fixedOptions === undefined ? (
                      <PlayableManagementIconActionButton
                        disabled={index >= visibleOutcomeCount - 1}
                        iconName="arrow-down"
                        label={t(`${translationRoot}.moveItemDownShort`)}
                        onClick={() =>
                          setEditorState(
                            playableOutcomeEditorPolicy.moveOutcome(editorState, index, index + 1),
                          )
                        }
                      />
                    ) : null}
                    {visibleOutcomeCount > 2 && fixedOptions === undefined ? (
                      <PlayableManagementIconActionButton
                        iconName="trash"
                        label={t(`${translationRoot}.removeOutcomeShort`)}
                        onClick={() => requestOutcomeRemoval(index, label)}
                      />
                    ) : null}
                  </ActionRow>
                </ContentStack>
              </div>
            </div>
          );
        })}
        {dropPreview?.slot === visibleOutcomeIndexes.length ? (
          <ReorderDropIndicator compact />
        ) : null}
      </ContentStack>
      <ConfirmDialog
        cancelLabel={t(`${translationRoot}.confirmCancel`)}
        confirmLabel={t(`${translationRoot}.removeOutcomeConfirmAction`)}
        isOpen={confirmDialog.dialogState.isOpen}
        message={confirmDialog.dialogState.message}
        onCancel={confirmDialog.cancel}
        onConfirm={confirmDialog.confirm}
        title={pendingOutcomeRemoval ? t(`${translationRoot}.removeOutcomeConfirmTitle`) : ''}
      />
    </>
  );
}
