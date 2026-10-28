import { AnimatePresence, animate, LayoutGroup, motion, useMotionValue } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { ContentStack, SplitWrapRow } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel, InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { MotionStagger, MotionStaggerItem } from '../../../../../shared/ui/motion/motion-primitives';
import { usePrefersReducedMotion } from '../../../../../shared/ui/motion/use-prefers-reduced-motion';
import { createPartyFinalSummaryModel, toPartyFinalSummaryPlayerKey } from './party-final-summary-panel.model';
import {
  mobileRankGroupStyle,
  mobileStandingsIdentityStyle,
  mobileStandingsNameGroupStyle,
  mobileStandingsRowStyle,
  mobileStandingsTopStyle,
  standingsBodyStyle,
  standingsListStyle,
  standingsRankStyle,
  standingsResponseStatsStyle,
  standingsRowStyle,
  standingsUsernameStyle,
} from './party-final-summary-panel.styles';

const REVEAL_PRELUDE_MS = 1500;
const SCORE_COUNT_UP_MS = 1200;

interface PartyStandingsListProps {
  readonly headingLevel?: 2 | 3;
  readonly initialDelay?: number;
  readonly isMobile?: boolean;
  readonly players: readonly PartyObservationPlayer[];
  readonly previousPlayers?: readonly PartyObservationPlayer[];
  readonly staggerDelay?: number;
  readonly testIdPrefix: string;
  readonly totalStages: number;
  readonly title?: string;
}

interface RankedPlayer {
  readonly currentRank: number;
  readonly key: string;
  readonly player: PartyObservationPlayer;
  readonly previousRank: number | null;
  readonly previousScore: number | null;
}

export function PartyStandingsList({
  headingLevel = 3,
  initialDelay = 0.08,
  isMobile = false,
  players,
  previousPlayers,
  staggerDelay = 0.05,
  testIdPrefix,
  totalStages,
  title: titleProp,
}: PartyStandingsListProps) {
  const { t } = usePresentationTranslation();
  const title = titleProp ?? t('game.party.route.finalSummaryStandingsTitle');

  const hasPreviousData = previousPlayers !== undefined;

  const rankedPlayers = useMemo(() => buildRankedPlayers(players, previousPlayers), [players, previousPlayers]);

  if (rankedPlayers.length === 0) {
    return null;
  }

  return (
    <ElevatedPanel padding={isMobile ? 'md' : 'lg'}>
      <ContentStack gap="md">
        <SplitWrapRow align="baseline" gap="md">
          <Heading level={headingLevel}>{title}</Heading>
          <Badge tone="accent">{rankedPlayers.length}</Badge>
        </SplitWrapRow>

        {hasPreviousData ? (
          <StandingsRevealList
            initialDelay={initialDelay}
            isMobile={isMobile}
            rankedPlayers={rankedPlayers}
            staggerDelay={staggerDelay}
            t={t}
            testIdPrefix={testIdPrefix}
            totalStages={totalStages}
            title={title}
          />
        ) : (
          <StandingsStaticList
            initialDelay={initialDelay}
            isMobile={isMobile}
            rankedPlayers={rankedPlayers}
            staggerDelay={staggerDelay}
            t={t}
            testIdPrefix={testIdPrefix}
            totalStages={totalStages}
            title={title}
          />
        )}
      </ContentStack>
    </ElevatedPanel>
  );
}

interface StandingsListInternalProps {
  readonly initialDelay: number;
  readonly isMobile: boolean;
  readonly rankedPlayers: readonly RankedPlayer[];
  readonly staggerDelay: number;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
  readonly testIdPrefix: string;
  readonly totalStages: number;
  readonly title: string;
}

function StandingsStaticList({
  initialDelay,
  isMobile,
  rankedPlayers,
  staggerDelay,
  t,
  testIdPrefix,
  totalStages,
  title,
}: StandingsListInternalProps) {
  return (
    <MotionStagger initialDelay={initialDelay} staggerDelay={staggerDelay}>
      <ol aria-label={title} data-testid={testIdPrefix} style={standingsListStyle}>
        {rankedPlayers.map((entry) => (
          <MotionStaggerItem as="li" key={entry.key}>
            <StandingsRow
              entry={entry}
              isMobile={isMobile}
              revealed
              showDelta={false}
              t={t}
              testIdPrefix={testIdPrefix}
              totalStages={totalStages}
            />
          </MotionStaggerItem>
        ))}
      </ol>
    </MotionStagger>
  );
}

function StandingsRevealList({
  initialDelay,
  isMobile,
  rankedPlayers,
  staggerDelay,
  t,
  testIdPrefix,
  totalStages,
  title,
}: StandingsListInternalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, REVEAL_PRELUDE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  const displayed = useMemo(
    () =>
      revealed
        ? [...rankedPlayers].sort((a, b) => a.currentRank - b.currentRank)
        : [...rankedPlayers].sort(
            (a, b) => (a.previousRank ?? rankedPlayers.length + 1) - (b.previousRank ?? rankedPlayers.length + 1),
          ),
    [rankedPlayers, revealed],
  );

  return (
    <LayoutGroup>
      <MotionStagger initialDelay={initialDelay} staggerDelay={staggerDelay}>
        <ol aria-label={title} data-testid={testIdPrefix} style={standingsListStyle}>
          {displayed.map((entry) => (
            <motion.li
              key={entry.key}
              layout
              style={{ listStyle: 'none' }}
              transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
            >
              <MotionStaggerItem>
                <StandingsRow
                  entry={entry}
                  isMobile={isMobile}
                  revealed={revealed}
                  showDelta
                  t={t}
                  testIdPrefix={testIdPrefix}
                  totalStages={totalStages}
                />
              </MotionStaggerItem>
            </motion.li>
          ))}
        </ol>
      </MotionStagger>
    </LayoutGroup>
  );
}

interface StandingsRowProps {
  readonly entry: RankedPlayer;
  readonly isMobile: boolean;
  readonly revealed: boolean;
  readonly showDelta: boolean;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
  readonly testIdPrefix: string;
  readonly totalStages: number;
}

function StandingsRow({ entry, isMobile, revealed, showDelta, t, testIdPrefix, totalStages }: StandingsRowProps) {
  const displayRank = revealed ? entry.currentRank : (entry.previousRank ?? entry.currentRank);

  if (isMobile) {
    return (
      <MobileStandingsRow
        displayRank={displayRank}
        entry={entry}
        revealed={revealed}
        showDelta={showDelta}
        t={t}
        testIdPrefix={testIdPrefix}
        totalStages={totalStages}
      />
    );
  }

  return (
    <DesktopStandingsRow
      displayRank={displayRank}
      entry={entry}
      revealed={revealed}
      showDelta={showDelta}
      t={t}
      testIdPrefix={testIdPrefix}
      totalStages={totalStages}
    />
  );
}

interface StandingsRowVariantProps {
  readonly displayRank: number;
  readonly entry: RankedPlayer;
  readonly revealed: boolean;
  readonly showDelta: boolean;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
  readonly testIdPrefix: string;
  readonly totalStages: number;
}

interface ResponseStatsProps {
  readonly correctStages: number;
  readonly fromScore: number;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
  readonly toScore: number;
  readonly totalStages: number;
  readonly stagePoints: number | null;
}

function ResponseStats({ correctStages, fromScore, t, toScore, totalStages, stagePoints }: ResponseStatsProps) {
  return (
    <div style={standingsResponseStatsStyle}>
      <Badge tone="accent">
        <AnimatedScore from={fromScore} t={t} to={toScore} />
      </Badge>
      {stagePoints !== null ? (
        <SupportingText size="sm">{t('game.party.route.stageResultsPoints', { count: stagePoints })}</SupportingText>
      ) : null}
      <SupportingText tone="soft" size="sm">
        {t('game.party.route.finalLeaderboardResponseSuccessRatio', {
          correct: String(correctStages),
          total: String(totalStages),
        })}
      </SupportingText>
    </div>
  );
}

function DesktopStandingsRow({
  displayRank,
  entry,
  revealed,
  showDelta,
  t,
  testIdPrefix,
  totalStages,
}: StandingsRowVariantProps) {
  const { player, previousScore } = entry;
  const fromScore = previousScore ?? player.totalScore;
  const toScore = revealed ? player.totalScore : (previousScore ?? player.totalScore);

  return (
    <InsetPanel padding="md" tone={player.isCurrentPlayer ? 'accent' : 'default'}>
      <div data-testid={`${testIdPrefix}-rank-${displayRank}`} style={standingsRowStyle}>
        <span style={standingsRankStyle}>#{displayRank}</span>
        <div style={standingsBodyStyle}>
          <UserAvatar
            alt={t('game.party.route.finalSummaryAvatarAlt', { username: player.username })}
            size={44}
            src={player.avatarUri}
          />
          <p style={standingsUsernameStyle}>{player.username}</p>
          {player.isCurrentPlayer ? <Badge tone="success">{t('game.party.route.youBadge')}</Badge> : null}
          {showDelta ? <RankChangeBadge entry={entry} revealed={revealed} t={t} /> : null}
        </div>
        <ResponseStats
          correctStages={player.correctStages}
          stagePoints={showDelta && revealed && previousScore !== null ? player.totalScore - previousScore : null}
          fromScore={fromScore}
          t={t}
          toScore={toScore}
          totalStages={totalStages}
        />
      </div>
    </InsetPanel>
  );
}

function MobileStandingsRow({
  displayRank,
  entry,
  revealed,
  showDelta,
  t,
  testIdPrefix,
  totalStages,
}: StandingsRowVariantProps) {
  const { player, previousScore } = entry;
  const fromScore = previousScore ?? player.totalScore;
  const toScore = revealed ? player.totalScore : (previousScore ?? player.totalScore);

  return (
    <InsetPanel padding="md" tone={player.isCurrentPlayer ? 'accent' : 'default'}>
      <div data-testid={`${testIdPrefix}-rank-${displayRank}`} style={mobileStandingsRowStyle}>
        <div style={mobileStandingsTopStyle}>
          <div style={mobileRankGroupStyle}>
            <Badge tone="neutral">#{displayRank}</Badge>
            {showDelta ? <RankChangeBadge entry={entry} revealed={revealed} t={t} /> : null}
          </div>
          <ResponseStats
            correctStages={player.correctStages}
            stagePoints={showDelta && revealed && previousScore !== null ? player.totalScore - previousScore : null}
            fromScore={fromScore}
            t={t}
            toScore={toScore}
            totalStages={totalStages}
          />
        </div>
        <div style={mobileStandingsIdentityStyle}>
          <UserAvatar
            alt={t('game.party.route.finalSummaryAvatarAlt', { username: player.username })}
            size={40}
            src={player.avatarUri}
          />
          <div style={mobileStandingsNameGroupStyle}>
            <p style={standingsUsernameStyle}>{player.username}</p>
            {player.isCurrentPlayer ? <Badge tone="success">{t('game.party.route.youBadge')}</Badge> : null}
          </div>
        </div>
      </div>
    </InsetPanel>
  );
}

interface RankChangeBadgeProps {
  readonly entry: RankedPlayer;
  readonly revealed: boolean;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
}

function RankChangeBadge({ entry, revealed, t }: RankChangeBadgeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const change = computeRankChange(entry);

  if (!revealed || !change) {
    return null;
  }

  const badge = <Badge tone={change.tone}>{t(change.labelKey, change.labelValues)}</Badge>;

  if (prefersReducedMotion) {
    return <span>{badge}</span>;
  }

  return (
    <AnimatePresence>
      <motion.span
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        initial={{ opacity: 0, scale: 0.6 }}
        key={change.kind}
        transition={{ type: 'spring', stiffness: 360, damping: 18, delay: 0.05 }}
      >
        {badge}
      </motion.span>
    </AnimatePresence>
  );
}

interface AnimatedScoreProps {
  readonly from: number;
  readonly t: ReturnType<typeof usePresentationTranslation>['t'];
  readonly to: number;
}

function AnimatedScore({ from, t, to }: AnimatedScoreProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionValue = useMotionValue(from);
  const [displayed, setDisplayed] = useState<number>(from);

  useEffect(() => {
    if (prefersReducedMotion || from === to) {
      motionValue.set(to);
      setDisplayed(to);
      return;
    }

    motionValue.set(from);
    const controls = animate(motionValue, to, {
      duration: SCORE_COUNT_UP_MS / 1000,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayed(Math.round(latest));
      },
    });

    return () => {
      controls.stop();
    };
  }, [from, to, motionValue, prefersReducedMotion]);

  return <>{t('game.party.route.finalLeaderboardScore', { points: String(displayed) })}</>;
}

interface RankChange {
  readonly kind: 'up' | 'down' | 'same' | 'new';
  readonly labelKey: string;
  readonly labelValues?: Record<string, string | number>;
  readonly tone: 'success' | 'warning' | 'neutral' | 'info';
}

function computeRankChange(entry: RankedPlayer): RankChange | null {
  if (entry.previousRank === null) {
    return {
      kind: 'new',
      labelKey: 'game.party.route.stageResultsRankChangeNew',
      tone: 'info',
    };
  }

  const delta = entry.previousRank - entry.currentRank;

  if (delta > 0) {
    return {
      kind: 'up',
      labelKey: 'game.party.route.stageResultsRankChangeUp',
      labelValues: { count: delta },
      tone: 'success',
    };
  }

  if (delta < 0) {
    return {
      kind: 'down',
      labelKey: 'game.party.route.stageResultsRankChangeDown',
      labelValues: { count: -delta },
      tone: 'warning',
    };
  }

  return {
    kind: 'same',
    labelKey: 'game.party.route.stageResultsRankChangeSame',
    tone: 'neutral',
  };
}

function buildRankedPlayers(
  players: readonly PartyObservationPlayer[],
  previousPlayers: readonly PartyObservationPlayer[] | undefined,
): readonly RankedPlayer[] {
  const sortedByCurrent = createPartyFinalSummaryModel(players).rankedPlayers;
  const previousByKey = new Map(
    createPartyFinalSummaryModel(previousPlayers ?? []).rankedPlayers.map((player, index) => [
      toPartyFinalSummaryPlayerKey(player),
      { rank: index + 1, score: player.totalScore },
    ]),
  );

  return sortedByCurrent.map((player, index) => {
    const key = toPartyFinalSummaryPlayerKey(player);
    const previous = previousByKey.get(key);
    return {
      currentRank: index + 1,
      key,
      player,
      previousRank: previous?.rank ?? null,
      previousScore: previous?.score ?? null,
    } satisfies RankedPlayer;
  });
}
