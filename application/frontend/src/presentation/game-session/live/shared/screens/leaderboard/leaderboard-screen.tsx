import { useMemo } from 'react';
import type { LeaderboardEntry } from '../../../../../../domains/game-session/entities/leaderboard-entry';
import { useAuth } from '../../../../../identity/contexts/auth-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../../../shared/routing/game-session-route-context';
import {
  usePresentationNavigate,
  usePresentationParams,
} from '../../../../../shared/routing/router';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { SubpageHeader } from '../../../../../shared/ui/layout/subpage-header';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { LeaderboardCelebration } from '../../animations/leaderboard-celebration';
import { LeaderboardRevealAnimation } from '../../animations/leaderboard-reveal-animation';
import { useGameJoin } from '../../contexts/game-join-context';
import { useGameLeaderboard } from '../../contexts/game-leaderboard-context';
import { useGamePlaying } from '../../contexts/game-playing-context';
import { useGameTypeLiveRegistry } from '../../contexts/game-type-live-registry-context';
import { LeaderboardPodiumCard } from './components/leaderboard-podium-card';
import { LeaderboardRow } from './components/leaderboard-row';
import { LeaderboardSessionBar } from './components/leaderboard-session-bar';
import {
  heroRootStyle,
  heroSubtitleStyle,
  heroTitleStyle,
  heroTrophyStyle,
  LEADERBOARD_KEYFRAMES_CSS,
  podiumGridStyle,
  rankingsContainerStyle,
} from './leaderboard-styles';

const PODIUM_GLOW_COLORS: Record<number, string> = {
  1: uiThemeTokens.leaderboard.podiumGlow.first,
  2: uiThemeTokens.leaderboard.podiumGlow.second,
  3: uiThemeTokens.leaderboard.podiumGlow.third,
};

const PODIUM_REVEAL_DELAYS: Record<number, number> = {
  1: 0.8,
  2: 0.4,
  3: 0,
};

const PODIUM_DISPLAY_ORDER = [2, 1, 3] as const;

export function LeaderboardScreen() {
  const { guestNickname } = useGameJoin();
  const leaderboardService = useGameLeaderboard();
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { resolveJoinRoute } = useGameSessionRoutes();
  const registry = useGameTypeLiveRegistry();
  const { sessionPin } = usePresentationParams<'sessionPin'>();
  const { hasRestoredSession, isAuthenticated, user } = useAuth();
  const { hasGameEnded, leaderboard, gameTitle, gameType } = useGamePlaying();
  const gameJoinRoute = resolveJoinRoute();
  const gameTypeTitleKey = gameType ? registry.resolve(gameType).titleKey : null;

  const normalizedSessionPin = (sessionPin ?? '').trim().toUpperCase();

  const { podiumEntries, sortedEntries } = useMemo(
    () => leaderboardService.sortEntries(leaderboard),
    [leaderboard],
  );

  const currentPlayerEntry = useMemo(
    () =>
      leaderboardService.findCurrentPlayer(
        sortedEntries,
        isAuthenticated && user ? user.id : null,
        guestNickname,
      ),
    [guestNickname, isAuthenticated, sortedEntries, user],
  );

  if (!normalizedSessionPin || !hasRestoredSession || !hasGameEnded) {
    return (
      <>
        <SubpageHeader
          kicker={t('game.leaderboard.eyebrow')}
          title={t('game.leaderboard.loadingTitle')}
          subtitle={t('game.leaderboard.loadingDescription')}
        />
        <StatusBanner tone="info">{t('game.leaderboard.loadingSyncing')}</StatusBanner>
      </>
    );
  }

  const orderedPodium = PODIUM_DISPLAY_ORDER.map((rank) =>
    podiumEntries.find((entry) => entry.rank === rank),
  ).filter((entry): entry is LeaderboardEntry => entry !== undefined);

  return (
    <LeaderboardRevealAnimation>
      <style>{LEADERBOARD_KEYFRAMES_CSS}</style>

      <LeaderboardRevealAnimation.Hero>
        <header style={heroRootStyle}>
          <LeaderboardCelebration />
          <LeaderboardRevealAnimation.Trophy>
            <span style={heroTrophyStyle} aria-hidden="true">
              <AppIcon name="trophy" size={48} />
            </span>
          </LeaderboardRevealAnimation.Trophy>
          <h2 style={heroTitleStyle}>{t('game.leaderboard.title')}</h2>
          <p style={heroSubtitleStyle}>{t('game.leaderboard.subtitle')}</p>
        </header>
      </LeaderboardRevealAnimation.Hero>

      <LeaderboardRevealAnimation.PlayerBar>
        <LeaderboardSessionBar
          gameTypeTitleKey={gameTypeTitleKey}
          gameTitle={gameTitle}
          sessionPin={normalizedSessionPin}
          rankLabel={
            currentPlayerEntry
              ? t('game.leaderboard.currentPlayerRank', {
                  rank: String(currentPlayerEntry.rank),
                  points: String(currentPlayerEntry.totalPoints),
                })
              : null
          }
        />
      </LeaderboardRevealAnimation.PlayerBar>

      {sortedEntries.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Heading level={3}>{t('game.leaderboard.emptyStandingsTitle')}</Heading>
          <SupportingText marginTop="sm">{t('game.leaderboard.emptyStatus')}</SupportingText>
        </div>
      ) : (
        <>
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={podiumGridStyle}>
              {orderedPodium.map((entry) => (
                <LeaderboardRevealAnimation.Podium
                  key={`${entry.rank}-${entry.username}`}
                  delay={PODIUM_REVEAL_DELAYS[entry.rank]}
                  glowColor={PODIUM_GLOW_COLORS[entry.rank]}
                >
                  <LeaderboardPodiumCard
                    avatarUri={entry.avatarUri}
                    entry={entry}
                    isCurrentPlayer={leaderboardService.isSameEntry(entry, currentPlayerEntry)}
                  />
                </LeaderboardRevealAnimation.Podium>
              ))}
            </div>
          </div>

          {sortedEntries.length > 0 ? (
            <LeaderboardRevealAnimation.Rankings style={rankingsContainerStyle}>
              {sortedEntries.map((entry) => (
                <LeaderboardRevealAnimation.Row key={`${entry.rank}-${entry.username}`}>
                  <LeaderboardRow
                    avatarUri={entry.avatarUri}
                    entry={entry}
                    isCurrentPlayer={leaderboardService.isSameEntry(entry, currentPlayerEntry)}
                  />
                </LeaderboardRevealAnimation.Row>
              ))}
            </LeaderboardRevealAnimation.Rankings>
          ) : null}
        </>
      )}

      <LeaderboardRevealAnimation.Cta>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
          {isAuthenticated && user ? (
            <Button intent="outline" onClick={() => navigate('/workspace/dashboard')}>
              {t('game.leaderboard.backToDashboardCta')}
            </Button>
          ) : (
            <Button intent="outline" onClick={() => navigate(gameJoinRoute)}>
              {t('game.leaderboard.backToJoinCta')}
            </Button>
          )}
        </div>
      </LeaderboardRevealAnimation.Cta>
    </LeaderboardRevealAnimation>
  );
}
