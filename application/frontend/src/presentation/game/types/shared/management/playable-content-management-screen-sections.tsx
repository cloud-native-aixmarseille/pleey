import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { PlayableManagementItem } from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../shared/ui/actions/button';
import { UnderlineTabButton } from '../../../../shared/ui/actions/underline-tab-button';
import { Badge } from '../../../../shared/ui/feedback/badge';
import { Checkbox } from '../../../../shared/ui/forms/checkbox';
import { FieldShell } from '../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../shared/ui/forms/input';
import { Textarea } from '../../../../shared/ui/forms/textarea';
import {
  ActionRow,
  ContentStack,
  ResponsiveGrid,
  SplitWrapRow,
} from '../../../../shared/ui/layout/containers';
import { ElevatedPanel, InsetPanel } from '../../../../shared/ui/layout/panels';
import { Heading, SummaryText, SupportingText } from '../../../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../../../workspace/shared/contexts/workspace-dependencies-context';
import {
  createPlayableItemEditorStateFromItem,
  type PlayableItemKindConfig,
} from './playable-content-management-model';
import { editorLayoutStyle, tabsStyle } from './playable-content-management-screen-sections.styles';
import {
  type PlayableItemEditorValidator,
  type PlayableManagementValidationIssueCode,
} from './playable-item-editor-validator';

export enum PlayableManagementTab {
  SETUP = 'setup',
  STAGES = 'stages',
  REVIEW = 'review',
}

export function PlayableManagementTabPanel({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function PlayableManagementEditorLayout({ children }: PropsWithChildren) {
  return <div style={editorLayoutStyle}>{children}</div>;
}

function PlayableManagementTabList({
  children,
  label,
}: PropsWithChildren<{ readonly label: string }>) {
  return (
    <div aria-label={label} role="tablist" style={tabsStyle}>
      {children}
    </div>
  );
}

function PlayableManagementTabTrigger({
  active,
  children,
  onClick,
}: {
  readonly active: boolean;
  readonly children: ReactNode;
  readonly onClick: () => void;
}) {
  return (
    <UnderlineTabButton active={active} aria-selected={active} onClick={onClick} role="tab">
      {children}
    </UnderlineTabButton>
  );
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
  const tabs = [
    {
      active: activeTab === PlayableManagementTab.SETUP,
      key: PlayableManagementTab.SETUP,
      label: t(`${translationRoot}.tabSetup`),
      onClick: onOpenSetup,
    },
    {
      active: activeTab === PlayableManagementTab.STAGES,
      key: PlayableManagementTab.STAGES,
      label: t(`${translationRoot}.tabStages`),
      onClick: onOpenStages,
    },
    {
      active: activeTab === PlayableManagementTab.REVIEW,
      key: PlayableManagementTab.REVIEW,
      label: t(`${translationRoot}.tabReview`),
      onClick: onOpenReview,
    },
  ] as const;

  return (
    <PlayableManagementTabList label={t(`${translationRoot}.tabsLabel`)}>
      {tabs.map((tab) => (
        <PlayableManagementTabTrigger active={tab.active} key={tab.key} onClick={tab.onClick}>
          {tab.label}
        </PlayableManagementTabTrigger>
      ))}
    </PlayableManagementTabList>
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

function ReviewMetricCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <InsetPanel padding="md">
      <ContentStack gap="xs">
        <SupportingText>{label}</SupportingText>
        <Heading level={3}>{value}</Heading>
      </ContentStack>
    </InsetPanel>
  );
}

function ReviewItemSummaryCard({
  isReady,
  item,
  issues,
  onEditItem,
  translationRoot,
}: {
  readonly isReady: boolean;
  readonly item: PlayableManagementItem;
  readonly issues: readonly PlayableManagementValidationIssueCode[];
  readonly onEditItem: (item: PlayableManagementItem) => void;
  readonly translationRoot: string;
}) {
  const { t } = usePresentationTranslation();

  return (
    <InsetPanel padding="md">
      <ContentStack gap="sm">
        <SplitWrapRow gap="sm">
          <ContentStack gap="xs">
            <SupportingText>
              {t(`${translationRoot}.itemPosition`, {
                position: String(item.position + 1),
              })}
            </SupportingText>
            <SummaryText>
              {resolveReviewItemTitle(item, t(`${translationRoot}.itemUntitled`))}
            </SummaryText>
          </ContentStack>
          <Badge tone={isReady ? 'success' : 'warning'}>
            {isReady ? t(`${translationRoot}.ready`) : t(`${translationRoot}.incomplete`)}
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
                .map((issue) => t(`${translationRoot}.${resolveValidationTranslationKey(issue)}`))
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
        <ActionRow>
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
        </ActionRow>
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
          <ReviewMetricCard
            label={t(`${translationRoot}.itemsTitle`)}
            value={String(items.length)}
          />
          <ReviewMetricCard label={t(`${translationRoot}.ready`)} value={String(readyCount)} />
          <ReviewMetricCard label={t(`${translationRoot}.incomplete`)} value={String(issueCount)} />
          <ReviewMetricCard
            label={t(`${translationRoot}.reviewTotalDurationLabel`)}
            value={t(`${translationRoot}.reviewTotalDurationValue`, {
              seconds: String(totalDuration),
            })}
          />
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
                    <ReviewItemSummaryCard
                      isReady={isReady}
                      item={item}
                      issues={issues}
                      key={item.id}
                      onEditItem={onEditItem}
                      translationRoot={translationRoot}
                    />
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
