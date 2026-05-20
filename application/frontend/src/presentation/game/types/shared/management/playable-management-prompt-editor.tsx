import { type DragEvent, useEffect, useMemo, useState } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { Badge } from '../../../../shared/ui/feedback/badge';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { Select } from '../../../../shared/ui/forms/select';
import { Textarea } from '../../../../shared/ui/forms/textarea';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import {
  ActionRow,
  ContentStack,
  ResponsiveGrid,
  SplitWrapRow,
} from '../../../../shared/ui/layout/containers';
import { ElevatedPanel, InsetPanel } from '../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../shared/ui/layout/typography';
import {
  type PlayableItemEditorState,
  type PlayableItemKindConfig,
  resolvePlayableItemKindOption,
} from './playable-content-management-model';
import {
  PlayableItemEditorValidator,
  type PlayableManagementValidationIssue,
  type PlayableManagementValidationIssueCode,
} from './playable-item-editor-validator';
import {
  type PlayableManagementDropPreview,
  playableManagementDragPlacement,
} from './playable-management-drag-placement';
import {
  MAX_PLAYABLE_OUTCOME_COUNT,
  playableOutcomeEditorPolicy,
} from './playable-outcome-editor-policy';

interface PlayableManagementPromptEditorProps {
  readonly editorState: PlayableItemEditorState;
  readonly isSaving: boolean;
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly translationRoot: string;
  readonly onSave: () => void;
  readonly setEditorState: (editorState: PlayableItemEditorState) => void;
}

const outcomeBlockStyle = (selected: boolean, canReorder: boolean) =>
  ({
    background: 'var(--mantine-color-dark-7)',
    border: selected
      ? '1px solid var(--mantine-color-brand-5)'
      : '1px solid var(--mantine-color-dark-4)',
    borderRadius: '1rem',
    cursor: canReorder ? 'grab' : 'default',
    padding: '1rem',
  }) as const;

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

const advancedSettingsSummaryStyle = {
  cursor: 'pointer',
} as const;

function resolveValidationTranslationKey(
  code: PlayableManagementValidationIssueCode,
): `validation.${PlayableManagementValidationIssueCode}` {
  return `validation.${code}`;
}

export function PlayableManagementPromptEditor({
  editorState,
  isSaving,
  itemKindConfig,
  onSave,
  setEditorState,
  translationRoot,
}: PlayableManagementPromptEditorProps) {
  const { t } = usePresentationTranslation();
  const [visibleOutcomeCount, setVisibleOutcomeCount] = useState(() =>
    playableOutcomeEditorPolicy.resolveInitialOutcomeCount(editorState, itemKindConfig),
  );
  const [draggedOutcomeIndex, setDraggedOutcomeIndex] = useState<number | null>(null);
  const [dropPreview, setDropPreview] = useState<PlayableManagementDropPreview | null>(null);
  const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);
  const fixedOptions = selectedKindOption?.fixedOptions;
  const validationIssues: readonly PlayableManagementValidationIssue[] = useMemo(
    () => PlayableItemEditorValidator.validate(editorState, itemKindConfig),
    [editorState, itemKindConfig],
  );
  const isReadyToSave = validationIssues.length === 0;
  const titleKey = editorState.id ? 'editItemTitle' : 'createItemTitle';
  const canReorderOutcomes = fixedOptions === undefined && visibleOutcomeCount > 2;

  useEffect(() => {
    setVisibleOutcomeCount(
      playableOutcomeEditorPolicy.resolveInitialOutcomeCount(editorState, itemKindConfig),
    );
  }, [editorState.id, editorState.kind, itemKindConfig]);

  const visibleOutcomeIndexes = Array.from(
    { length: fixedOptions?.length ?? visibleOutcomeCount },
    (_, index) => index,
  );

  const getOutcomeAriaLabel = (label: string) =>
    `${t(`${translationRoot}.correctOptionLabel`)}: ${label}`;

  const dropIndicatorStyle = {
    background: 'var(--mantine-color-brand-5)',
    borderRadius: '999px',
    boxShadow: '0 0 0 4px color-mix(in srgb, var(--mantine-color-brand-5) 18%, transparent)',
    height: '0.25rem',
    margin: '0.15rem 0',
  } as const;

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="lg">
        <SplitWrapRow>
          <ContentStack gap="xs">
            <Heading level={2}>{t(`${translationRoot}.${titleKey}`)}</Heading>
            <SupportingText>{t(`${translationRoot}.editorSubtitle`)}</SupportingText>
          </ContentStack>
          <ActionRow justify="end">
            <Badge tone={isReadyToSave ? 'success' : 'warning'}>
              {isReadyToSave ? t(`${translationRoot}.ready`) : t(`${translationRoot}.incomplete`)}
            </Badge>
            <Button
              disabled={!isReadyToSave || isSaving}
              leftSection={<AppIcon name="save" size={14} />}
              onClick={onSave}
            >
              {editorState.id
                ? t(`${translationRoot}.saveItem`)
                : t(`${translationRoot}.createItem`)}
            </Button>
          </ActionRow>
        </SplitWrapRow>

        <FieldShell id="playable-item-text" label={t(`${translationRoot}.itemTextLabel`)} required>
          <Textarea
            id="playable-item-text"
            onChange={(event) => setEditorState({ ...editorState, text: event.target.value })}
            rows={4}
            value={editorState.text}
          />
        </FieldShell>

        {itemKindConfig ? (
          <FieldShell id="playable-item-kind" label={t(`${translationRoot}.kindLabel`)}>
            <Select
              id="playable-item-kind"
              onChange={(event) => {
                const nextKindOption = itemKindConfig.options.find(
                  (option) => option.value === event.target.value,
                );

                if (!nextKindOption) {
                  return;
                }

                setEditorState({
                  ...editorState,
                  correctPositions:
                    nextKindOption.correctSelectionMode === 'single'
                      ? ['0']
                      : editorState.correctPositions.length > 0
                        ? playableOutcomeEditorPolicy.normalizeCorrectPositions(
                            editorState.correctPositions,
                          )
                        : ['0'],
                  kind: nextKindOption.value,
                });
              }}
              value={editorState.kind ?? itemKindConfig.defaultKind}
            >
              {itemKindConfig.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
          </FieldShell>
        ) : null}

        <ContentStack gap="sm">
          <SplitWrapRow>
            <Heading level={3}>{t(`${translationRoot}.outcomesTitle`)}</Heading>
            {fixedOptions === undefined && visibleOutcomeCount < MAX_PLAYABLE_OUTCOME_COUNT ? (
              <Button
                intent="ghost"
                leftSection={<AppIcon name="plus" size={14} />}
                onClick={() =>
                  setVisibleOutcomeCount((count) => Math.min(MAX_PLAYABLE_OUTCOME_COUNT, count + 1))
                }
                size="sm"
              >
                {t(`${translationRoot}.addOutcome`)}
              </Button>
            ) : null}
          </SplitWrapRow>

          <ContentStack gap="sm">
            {visibleOutcomeIndexes.map((index) => {
              const label = fixedOptions
                ? t(fixedOptions[index]?.labelKey ?? `${translationRoot}.optionLabel`)
                : t(`${translationRoot}.optionLabel`, { position: String(index + 1) });
              const isCorrect = editorState.correctPositions.includes(String(index));
              const isDragging = draggedOutcomeIndex === index;
              const isDropTarget = dropPreview?.hoveredIndex === index;

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
                  const toIndex = playableManagementDragPlacement.resolveInsertionIndex(
                    fromIndex,
                    slot,
                  );

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
                      setDropPreview((current) =>
                        current?.hoveredIndex === index ? null : current,
                      );
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
                      ...outcomeBlockStyle(isCorrect, canReorderOutcomes),
                      background: isDropTarget
                        ? 'color-mix(in srgb, var(--mantine-color-brand-5) 6%, var(--mantine-color-dark-7))'
                        : outcomeBlockStyle(isCorrect, canReorderOutcomes).background,
                      border: isDropTarget
                        ? '1px solid var(--mantine-color-brand-4)'
                        : outcomeBlockStyle(isCorrect, canReorderOutcomes).border,
                      opacity: isDragging ? 0.45 : 1,
                      transition:
                        'background 120ms ease, border-color 120ms ease, opacity 120ms ease',
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
                                playableOutcomeEditorPolicy.moveOutcome(
                                  editorState,
                                  index,
                                  index - 1,
                                ),
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
                                playableOutcomeEditorPolicy.moveOutcome(
                                  editorState,
                                  index,
                                  index + 1,
                                ),
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
        </ContentStack>

        <details>
          <summary style={advancedSettingsSummaryStyle}>
            {t(`${translationRoot}.advancedSettings`)}
          </summary>
          <ContentStack gap="sm" marginTop="sm">
            <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="md">
              <FieldShell
                id="playable-item-time-limit"
                label={t(`${translationRoot}.timeLimitLabel`)}
                required
              >
                <Input
                  id="playable-item-time-limit"
                  min={5}
                  onChange={(event) =>
                    setEditorState({ ...editorState, timeLimit: event.target.value })
                  }
                  type="number"
                  value={editorState.timeLimit}
                />
              </FieldShell>
              <FieldShell
                id="playable-item-points"
                label={t(`${translationRoot}.pointsLabel`)}
                required
              >
                <Input
                  id="playable-item-points"
                  min={0}
                  onChange={(event) =>
                    setEditorState({ ...editorState, points: event.target.value })
                  }
                  type="number"
                  value={editorState.points}
                />
              </FieldShell>
            </ResponsiveGrid>
          </ContentStack>
        </details>

        {validationIssues.length > 0 ? (
          <InsetPanel tone="accent">
            <SupportingText>
              {t(`${translationRoot}.validationSummary`, {
                count: String(validationIssues.length),
              })}{' '}
              {validationIssues
                .map((issue) =>
                  t(`${translationRoot}.${resolveValidationTranslationKey(issue.code)}`),
                )
                .join(' ')}
            </SupportingText>
          </InsetPanel>
        ) : null}
      </ContentStack>
    </ElevatedPanel>
  );
}
