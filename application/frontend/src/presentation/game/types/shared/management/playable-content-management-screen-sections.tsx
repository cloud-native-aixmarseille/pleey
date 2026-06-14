import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { PlayableManagementItem } from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { Badge } from '../../../../shared/ui/feedback/badge';
import { Checkbox } from '../../../../shared/ui/forms/checkbox';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { Textarea } from '../../../../shared/ui/forms/textarea';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
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
  createPlayableItemEditorStateFromItem,
  type PlayableItemKindConfig,
} from './playable-content-management-model';
import {
  type PlayableItemEditorValidator,
  type PlayableManagementValidationIssueCode,
} from './playable-item-editor-validator';

export enum PlayableManagementTab {
  SETUP = 'setup',
  STAGES = 'stages',
  REVIEW = 'review',
}

const managementThemeVars = {
  activeTabBackground: `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 14%, transparent)`,
  activeTabBorder: uiThemeTokens.color.brand.primary,
  activeTabText: uiThemeTokens.color.text.link,
  panelBackground: uiThemeTokens.color.surface.recessed,
  panelBorder: uiThemeTokens.color.border.subtle,
  sectionGap: 'var(--mantine-spacing-lg)',
} as const;

const tabsStyle = {
  background: managementThemeVars.panelBackground,
  border: `1px solid ${managementThemeVars.panelBorder}`,
  borderRadius: '1rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  overflow: 'visible',
} as const;

const tabLabelStyle = {
  overflow: 'visible',
  textAlign: 'center',
  textOverflow: 'clip',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as const;

export const editorLayoutStyle = {
  display: 'grid',
  gap: managementThemeVars.sectionGap,
  gridTemplateColumns: 'minmax(18rem, 1fr) minmax(32rem, 2fr)',
  width: '100%',
} as const;

export const tabPanelShellStyle = {
  maxWidth: '100%',
  width: '100%',
} as const;

function createTabStyle(active: boolean) {
  return {
    background: active ? managementThemeVars.activeTabBackground : 'transparent',
    border: 0,
    borderBottom: active
      ? `2px solid ${managementThemeVars.activeTabBorder}`
      : '2px solid transparent',
    color: active ? managementThemeVars.activeTabText : 'inherit',
    cursor: 'pointer',
    fontWeight: 700,
    minHeight: '3rem',
    padding: '0.95rem',
  } as const;
}

export function PlayableManagementTabs({
  activeTab,
  onOpenStages,
  onOpenReview,
  onOpenSetup,
  translationRoot,
}: {
  readonly activeTab: PlayableManagementTab;
  readonly onOpenStages: () => void;
  readonly onOpenReview: () => void;
  readonly onOpenSetup: () => void;
  readonly translationRoot: string;
}) {
  const { t } = usePresentationTranslation();

  return (
    <div aria-label={t(`${translationRoot}.tabsLabel`)} role="tablist" style={tabsStyle}>
      <Button
        aria-selected={activeTab === PlayableManagementTab.SETUP}
        intent={activeTab === PlayableManagementTab.SETUP ? 'secondary' : 'ghost'}
        onClick={onOpenSetup}
        role="tab"
        labelStyle={tabLabelStyle}
        rootStyle={createTabStyle(activeTab === PlayableManagementTab.SETUP)}
        size="sm"
        type="button"
      >
        {t(`${translationRoot}.tabSetup`)}
      </Button>
      <Button
        aria-selected={activeTab === PlayableManagementTab.STAGES}
        intent={activeTab === PlayableManagementTab.STAGES ? 'secondary' : 'ghost'}
        onClick={onOpenStages}
        role="tab"
        labelStyle={tabLabelStyle}
        rootStyle={createTabStyle(activeTab === PlayableManagementTab.STAGES)}
        size="sm"
        type="button"
      >
        {t(`${translationRoot}.tabStages`)}
      </Button>
      <Button
        aria-selected={activeTab === PlayableManagementTab.REVIEW}
        intent={activeTab === PlayableManagementTab.REVIEW ? 'secondary' : 'ghost'}
        onClick={onOpenReview}
        role="tab"
        labelStyle={tabLabelStyle}
        rootStyle={createTabStyle(activeTab === PlayableManagementTab.REVIEW)}
        size="sm"
        type="button"
      >
        {t(`${translationRoot}.tabReview`)}
      </Button>
    </div>
  );
}

interface ReviewItemSummary {
  readonly isReady: boolean;
  readonly item: PlayableManagementItem;
  readonly issues: readonly PlayableManagementValidationIssueCode[];
}

function createReviewItemSummary(
  item: PlayableManagementItem,
  playableItemEditorValidator: PlayableItemEditorValidator,
  itemKindConfig?: PlayableItemKindConfig,
): ReviewItemSummary {
  const issues = playableItemEditorValidator
    .validate(createPlayableItemEditorStateFromItem(item, itemKindConfig), itemKindConfig)
    .map((issue) => issue.code);

  return {
    isReady: issues.length === 0,
    item,
    issues,
  };
}

function resolveValidationTranslationKey(
  code: PlayableManagementValidationIssueCode,
): `validation.${PlayableManagementValidationIssueCode}` {
  return `validation.${code}`;
}

function resolveReviewItemTitle(item: PlayableManagementItem, fallback: string): string {
  const trimmed = item.text.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed;
}

function ReviewChecklistRow({
  action,
  isComplete,
  label,
  translationRoot,
}: {
  readonly action?: ReactNode;
  readonly isComplete: boolean;
  readonly label: string;
  readonly translationRoot: string;
}) {
  const { t } = usePresentationTranslation();

  return (
    <SplitWrapRow gap="sm">
      <SplitWrapRow gap="sm">
        <Badge tone={isComplete ? 'success' : 'warning'}>
          {isComplete
            ? t(`${translationRoot}.reviewCheckPassed`)
            : t(`${translationRoot}.reviewCheckNeedsFix`)}
        </Badge>
        <SupportingText>{label}</SupportingText>
      </SplitWrapRow>
      {action ?? null}
    </SplitWrapRow>
  );
}

export function MetadataPanel({
  allowOptionChangeAfterVoting,
  description,
  isSaving,
  onSave,
  randomizeOptionOrder,
  randomizeStageOrder,
  title,
  translationRoot,
}: {
  readonly allowOptionChangeAfterVoting: boolean;
  readonly description: string | null;
  readonly isSaving: boolean;
  readonly onSave: (input: {
    readonly title: string;
    readonly description: string;
    readonly allowOptionChangeAfterVoting: boolean;
    readonly randomizeOptionOrder: boolean;
    readonly randomizeStageOrder: boolean;
  }) => void;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
  readonly title: string;
  readonly translationRoot: string;
}) {
  const { t } = usePresentationTranslation();
  const [titleValue, setTitleValue] = useState(title);
  const [descriptionValue, setDescriptionValue] = useState(description ?? '');
  const [allowOptionChangeAfterVotingValue, setAllowOptionChangeAfterVotingValue] = useState(
    allowOptionChangeAfterVoting,
  );
  const [randomizeOptionOrderValue, setRandomizeOptionOrderValue] = useState(randomizeOptionOrder);
  const [randomizeStageOrderValue, setRandomizeStageOrderValue] = useState(randomizeStageOrder);

  useEffect(() => {
    setTitleValue(title);
    setDescriptionValue(description ?? '');
    setAllowOptionChangeAfterVotingValue(allowOptionChangeAfterVoting);
    setRandomizeOptionOrderValue(randomizeOptionOrder);
    setRandomizeStageOrderValue(randomizeStageOrder);
  }, [allowOptionChangeAfterVoting, description, randomizeOptionOrder, randomizeStageOrder, title]);

  const isDirty =
    titleValue !== title ||
    descriptionValue !== (description ?? '') ||
    allowOptionChangeAfterVotingValue !== allowOptionChangeAfterVoting ||
    randomizeOptionOrderValue !== randomizeOptionOrder ||
    randomizeStageOrderValue !== randomizeStageOrder;

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="lg">
        <ContentStack gap="xs">
          <Heading level={2}>{t(`${translationRoot}.metadataTitle`)}</Heading>
          <SupportingText>{t(`${translationRoot}.editGame`)}</SupportingText>
        </ContentStack>
        <FieldShell id="playable-game-title" label={t(`${translationRoot}.titleLabel`)} required>
          <Input
            id="playable-game-title"
            onChange={(event) => setTitleValue(event.target.value)}
            value={titleValue}
          />
        </FieldShell>
        <FieldShell id="playable-game-description" label={t(`${translationRoot}.descriptionLabel`)}>
          <Textarea
            id="playable-game-description"
            onChange={(event) => setDescriptionValue(event.target.value)}
            rows={4}
            value={descriptionValue}
          />
        </FieldShell>
        <Checkbox
          id="playable-game-allow-option-change-after-voting"
          label={t(`${translationRoot}.allowOptionChangeAfterVotingLabel`)}
          description={t(`${translationRoot}.allowOptionChangeAfterVotingDescription`)}
          checked={allowOptionChangeAfterVotingValue}
          onChange={(event) => setAllowOptionChangeAfterVotingValue(event.currentTarget.checked)}
        />
        <Checkbox
          id="playable-game-randomize-stage-order"
          label={t(`${translationRoot}.randomizeStageOrderLabel`)}
          description={t(`${translationRoot}.randomizeStageOrderDescription`)}
          checked={randomizeStageOrderValue}
          onChange={(event) => setRandomizeStageOrderValue(event.currentTarget.checked)}
        />
        <Checkbox
          id="playable-game-randomize-option-order"
          label={t(`${translationRoot}.randomizeOptionOrderLabel`)}
          description={t(`${translationRoot}.randomizeOptionOrderDescription`)}
          checked={randomizeOptionOrderValue}
          onChange={(event) => setRandomizeOptionOrderValue(event.currentTarget.checked)}
        />
        <div>
          <Button
            disabled={isSaving || !isDirty || titleValue.trim().length === 0}
            onClick={() =>
              onSave({
                title: titleValue,
                description: descriptionValue,
                allowOptionChangeAfterVoting: allowOptionChangeAfterVotingValue,
                randomizeOptionOrder: randomizeOptionOrderValue,
                randomizeStageOrder: randomizeStageOrderValue,
              })
            }
          >
            {t(`${translationRoot}.saveMetadata`)}
          </Button>
        </div>
      </ContentStack>
    </ElevatedPanel>
  );
}

export function ReviewPanel({
  gameTitle,
  itemKindConfig,
  items,
  onEditItem,
  onGoToFirstIssue,
  onOpenStages,
  onOpenSetup,
  translationRoot,
}: {
  readonly gameTitle: string;
  readonly itemKindConfig?: PlayableItemKindConfig;
  readonly items: readonly PlayableManagementItem[];
  readonly onEditItem: (item: PlayableManagementItem) => void;
  readonly onGoToFirstIssue: () => void;
  readonly onOpenStages: () => void;
  readonly onOpenSetup: () => void;
  readonly translationRoot: string;
}) {
  const { t } = usePresentationTranslation();
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const itemSummaries = items.map((item) =>
    createReviewItemSummary(item, playableItemEditorValidator, itemKindConfig),
  );
  const readyCount = itemSummaries.filter((item) => item.isReady).length;
  const issueCount = itemSummaries.length - readyCount;
  const hasItems = items.length > 0;
  const isReadyForPlay = gameTitle.trim().length > 0 && hasItems && issueCount === 0;
  const totalDuration = items.reduce((sum, item) => sum + item.timeLimit, 0);

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="lg">
        <ContentStack gap="xs">
          <Heading level={2}>{t(`${translationRoot}.tabReview`)}</Heading>
          <SupportingText>
            {hasItems
              ? isReadyForPlay
                ? t(`${translationRoot}.reviewReadyMessage`, { count: String(readyCount) })
                : t(`${translationRoot}.reviewBlockedSummary`, {
                    issues: String(issueCount),
                    ready: String(readyCount),
                    total: String(items.length),
                  })
              : t(`${translationRoot}.reviewEmptyMessage`)}
          </SupportingText>
        </ContentStack>
        <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <InsetPanel padding="md">
            <ContentStack gap="xs">
              <SupportingText>{t(`${translationRoot}.itemsTitle`)}</SupportingText>
              <Heading level={3}>{String(items.length)}</Heading>
            </ContentStack>
          </InsetPanel>
          <InsetPanel padding="md">
            <ContentStack gap="xs">
              <SupportingText>{t(`${translationRoot}.ready`)}</SupportingText>
              <Heading level={3}>{String(readyCount)}</Heading>
            </ContentStack>
          </InsetPanel>
          <InsetPanel padding="md">
            <ContentStack gap="xs">
              <SupportingText>{t(`${translationRoot}.incomplete`)}</SupportingText>
              <Heading level={3}>{String(issueCount)}</Heading>
            </ContentStack>
          </InsetPanel>
          <InsetPanel padding="md">
            <ContentStack gap="xs">
              <SupportingText>{t(`${translationRoot}.reviewTotalDurationLabel`)}</SupportingText>
              <Heading level={3}>
                {t(`${translationRoot}.reviewTotalDurationValue`, {
                  seconds: String(totalDuration),
                })}
              </Heading>
            </ContentStack>
          </InsetPanel>
        </ResponsiveGrid>
        <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="lg">
          <InsetPanel padding="md">
            <ContentStack gap="md">
              <Heading level={3}>{t(`${translationRoot}.reviewChecklistTitle`)}</Heading>
              <ReviewChecklistRow
                action={
                  <Button intent="ghost" onClick={onOpenSetup} size="sm">
                    {t(`${translationRoot}.editGame`)}
                  </Button>
                }
                isComplete={gameTitle.trim().length > 0}
                label={t(`${translationRoot}.reviewCheckMetadata`)}
                translationRoot={translationRoot}
              />
              <ReviewChecklistRow
                action={
                  <Button intent="ghost" onClick={onOpenStages} size="sm">
                    {t(`${translationRoot}.tabStages`)}
                  </Button>
                }
                isComplete={hasItems}
                label={t(`${translationRoot}.reviewCheckHasItems`)}
                translationRoot={translationRoot}
              />
              <ReviewChecklistRow
                action={
                  !isReadyForPlay ? (
                    <Button intent="ghost" onClick={onGoToFirstIssue} size="sm">
                      {t(`${translationRoot}.goToFirstIssue`)}
                    </Button>
                  ) : undefined
                }
                isComplete={issueCount === 0 && hasItems}
                label={t(`${translationRoot}.reviewCheckReadyItems`)}
                translationRoot={translationRoot}
              />
            </ContentStack>
          </InsetPanel>
          <InsetPanel padding="md">
            <ContentStack gap="md">
              <SplitWrapRow gap="sm">
                <Heading level={3}>{t(`${translationRoot}.reviewItemsTitle`)}</Heading>
                <Badge tone={isReadyForPlay ? 'success' : 'warning'}>
                  {isReadyForPlay
                    ? t(`${translationRoot}.ready`)
                    : t(`${translationRoot}.incomplete`)}
                </Badge>
              </SplitWrapRow>
              {itemSummaries.length === 0 ? (
                <SupportingText>{t(`${translationRoot}.empty`)}</SupportingText>
              ) : (
                <ContentStack gap="sm">
                  {itemSummaries.map(({ isReady, item, issues }) => (
                    <InsetPanel key={item.id} padding="md">
                      <ContentStack gap="sm">
                        <SplitWrapRow gap="sm">
                          <ContentStack gap="xs">
                            <SupportingText>
                              {t(`${translationRoot}.itemPosition`, {
                                position: String(item.position + 1),
                              })}
                            </SupportingText>
                            <strong>
                              {resolveReviewItemTitle(item, t(`${translationRoot}.itemUntitled`))}
                            </strong>
                          </ContentStack>
                          <Badge tone={isReady ? 'success' : 'warning'}>
                            {isReady
                              ? t(`${translationRoot}.ready`)
                              : t(`${translationRoot}.incomplete`)}
                          </Badge>
                        </SplitWrapRow>
                        <SupportingText>
                          {t(`${translationRoot}.itemStats`, {
                            points: String(item.points),
                            seconds: String(item.timeLimit),
                          })}
                        </SupportingText>
                        {issues.length > 0 ? (
                          <InsetPanel tone="accent">
                            <SupportingText>
                              {issues
                                .map((issue) =>
                                  t(`${translationRoot}.${resolveValidationTranslationKey(issue)}`),
                                )
                                .join(' ')}
                            </SupportingText>
                          </InsetPanel>
                        ) : null}
                        <ActionRow justify="end">
                          <Button intent="ghost" onClick={() => onEditItem(item)} size="sm">
                            {t(`${translationRoot}.editItem`)}
                          </Button>
                        </ActionRow>
                      </ContentStack>
                    </InsetPanel>
                  ))}
                </ContentStack>
              )}
            </ContentStack>
          </InsetPanel>
        </ResponsiveGrid>
        {!isReadyForPlay ? (
          <ActionRow justify="end">
            <Button intent="ghost" onClick={onGoToFirstIssue}>
              {t(`${translationRoot}.goToFirstIssue`)}
            </Button>
          </ActionRow>
        ) : null}
      </ContentStack>
    </ElevatedPanel>
  );
}
