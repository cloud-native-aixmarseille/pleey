import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { ContentList, ContentListItem } from '../../../shared/ui/data/content-list';
import { Badge } from '../../../shared/ui/feedback/badge';
import { EmptyState, PendingState } from '../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { AccentIconBadge } from '../../../shared/ui/icons/accent-icon-badge';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, FlexGrowItem, SplitWrapRow, StretchRow } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { Heading, SummaryText, SupportingText } from '../../../shared/ui/layout/typography';
import { SecondaryActionLink } from '../../../shared/ui/navigation/links';
import { useProfileGameHistory } from './use-profile-game-history';

const STATUS_KEYS: Record<string, string> = {
  WAITING: 'auth.profile.history.waiting',
  ACTIVE: 'auth.profile.history.active',
  PAUSED: 'auth.profile.history.paused',
  ENDED: 'auth.profile.history.ended',
};

const GAME_TYPE_KEYS = {
  quiz: 'auth.profile.history.quiz',
  prediction: 'auth.profile.history.prediction',
  game: 'auth.profile.history.game',
};

interface ProfileGameHistorySectionProps {
  readonly active: boolean;
}

export function ProfileGameHistorySection({ active }: ProfileGameHistorySectionProps) {
  const { t, currentLanguage } = usePresentationTranslation();
  const { result, loading, failed, page, setPage, retry } = useProfileGameHistory(active);
  const formatDate = new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium' });
  const hasNextPage = result !== null && result.page < result.totalPages;

  return (
    <section aria-labelledby="profile-history-heading" aria-busy={loading}>
      <ContentStack gap="lg">
        <ContentStack gap="xs">
          <Heading id="profile-history-heading" level={2}>
            {t('auth.profile.history.title')}
          </Heading>
          <SupportingText>{t('auth.profile.history.description')}</SupportingText>
        </ContentStack>

        {loading && (
          <div role="status">
            <PendingState>{t('auth.profile.history.loading')}</PendingState>
          </div>
        )}
        {failed && (
          <ContentStack>
            <StatusBanner tone="error">{t('auth.profile.history.error')}</StatusBanner>
            <ActionRow>
              <Button intent="secondary" onClick={retry}>
                {t('auth.profile.history.retry')}
              </Button>
            </ActionRow>
          </ContentStack>
        )}
        {result?.items.length === 0 && (
          <ContentStack align="center">
            <EmptyState>{t(page === 1 ? 'auth.profile.history.empty' : 'auth.profile.history.emptyPage')}</EmptyState>
            {page === 1 && (
              <>
                <SupportingText>{t('auth.profile.history.emptyDescription')}</SupportingText>
                <SecondaryActionLink to="/workspace/dashboard">
                  {t('auth.profile.history.exploreCta')}
                </SecondaryActionLink>
              </>
            )}
          </ContentStack>
        )}
        {result && result.items.length > 0 && (
          <ContentList>
            {result.items.map((entry) => {
              const type = entry.gameType.toLowerCase();
              const gameType = type === 'quiz' || type === 'prediction' ? type : 'game';
              const status = entry.status.toUpperCase();

              return (
                <ContentListItem key={entry.partyId}>
                  <InsetPanel>
                    <StretchRow>
                      <span aria-hidden="true">
                        <AccentIconBadge size={40}>
                          <AppIcon name={gameType} size={21} />
                        </AccentIconBadge>
                      </span>
                      <FlexGrowItem>
                        <ContentStack gap="sm">
                          <Heading level={3}>{entry.title}</Heading>
                          <SupportingText>
                            <span>{t(GAME_TYPE_KEYS[gameType])}</span>
                            <span aria-hidden="true"> · </span>
                            <span>
                              {t(entry.role === 'host' ? 'auth.profile.history.host' : 'auth.profile.history.player')}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <time dateTime={entry.createdAt}>{formatDate.format(new Date(entry.createdAt))}</time>
                          </SupportingText>
                          <ActionRow>
                            <Badge tone={status === 'ACTIVE' ? 'success' : status === 'PAUSED' ? 'warning' : 'neutral'}>
                              {t(STATUS_KEYS[status] ?? 'auth.profile.history.unknownStatus')}
                            </Badge>
                            {entry.points !== null && (
                              <SummaryText>
                                {t('auth.profile.history.points', { points: String(entry.points) })}
                              </SummaryText>
                            )}
                          </ActionRow>
                        </ContentStack>
                      </FlexGrowItem>
                    </StretchRow>
                  </InsetPanel>
                </ContentListItem>
              );
            })}
          </ContentList>
        )}
        {(page > 1 || hasNextPage) && (
          <nav aria-label={t('auth.profile.history.paginationLabel')}>
            <SplitWrapRow>
              <SupportingText>{t('auth.profile.history.page', { page: String(page) })}</SupportingText>
              <ActionRow>
                <Button disabled={loading || page === 1} intent="ghost" onClick={() => setPage(page - 1)} size="sm">
                  {t('auth.profile.history.previous')}
                </Button>
                <Button
                  disabled={loading || !hasNextPage}
                  intent="secondary"
                  onClick={() => setPage(page + 1)}
                  size="sm"
                >
                  {t('auth.profile.history.next')}
                </Button>
              </ActionRow>
            </SplitWrapRow>
          </nav>
        )}
      </ContentStack>
    </section>
  );
}
