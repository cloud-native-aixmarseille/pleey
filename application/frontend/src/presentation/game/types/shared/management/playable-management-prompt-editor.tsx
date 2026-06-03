import { useEffect, useMemo, useState } from 'react';
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
import { useWorkspaceDependencies } from '../../../../workspace/shared/contexts/workspace-dependencies-context';
import {
  type PlayableItemEditorState,
  type PlayableItemKindConfig,
  resolvePlayableItemKindOption,
} from './playable-content-management-model';
import {
  type PlayableManagementValidationIssue,
  type PlayableManagementValidationIssueCode,
} from './playable-item-editor-validator';
import { type PlayableManagementDropPreview } from './playable-management-drag-placement';
import { PlayableManagementOutcomesEditor } from './playable-management-outcomes-editor';
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
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const [visibleOutcomeCount, setVisibleOutcomeCount] = useState(() =>
    playableOutcomeEditorPolicy.resolveInitialOutcomeCount(editorState, itemKindConfig),
  );
  const [draggedOutcomeIndex, setDraggedOutcomeIndex] = useState<number | null>(null);
  const [dropPreview, setDropPreview] = useState<PlayableManagementDropPreview | null>(null);
  const selectedKindOption = resolvePlayableItemKindOption(itemKindConfig, editorState.kind);
  const fixedOptions = selectedKindOption?.fixedOptions;
  const validationIssues: readonly PlayableManagementValidationIssue[] = useMemo(
    () => playableItemEditorValidator.validate(editorState, itemKindConfig),
    [editorState, itemKindConfig, playableItemEditorValidator],
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
            <PlayableManagementOutcomesEditor
              canReorderOutcomes={canReorderOutcomes}
              draggedOutcomeIndex={draggedOutcomeIndex}
              dropPreview={dropPreview}
              editorState={editorState}
              fixedOptions={fixedOptions}
              itemKindConfig={itemKindConfig}
              setDraggedOutcomeIndex={setDraggedOutcomeIndex}
              setDropPreview={setDropPreview}
              setEditorState={setEditorState}
              setVisibleOutcomeCount={setVisibleOutcomeCount}
              translationRoot={translationRoot}
              visibleOutcomeCount={visibleOutcomeCount}
              visibleOutcomeIndexes={visibleOutcomeIndexes}
            />
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
