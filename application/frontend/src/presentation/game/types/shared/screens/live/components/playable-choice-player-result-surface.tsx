import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { ContentStack, ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../../shared/ui/layout/use-presentation-media-query';
import {
  MotionFadeIn,
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { PlayerPartyStatusBar } from '../../../../../party/player/screens/components/player-party-status-bar';
import { PlayerRuntimeMobileMenu } from '../../../../../party/player/screens/components/player-runtime-mobile-menu';
import { PartyStandingsList } from '../../../../../party/shared/screens/components/party-standings-list';
import { usePartyStageScoreboardSnapshot } from '../../../../../party/shared/screens/use-party-stage-scoreboard-snapshot';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoicePlayerResultSurfaceProps } from './playable-choice-runtime-panel.types';

const mobileRootStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.canvas,
  bottom: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  left: 0,
  overflowY: 'auto',
  paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
  paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
  paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
  paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 200,
};

const mobileHeroBaseStyle: CSSProperties = {
  borderRadius: uiThemeTokens.radius.panel,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: uiThemeTokens.spacing.lg,
  textAlign: 'center',
};

const mobileHeroIconWrapperStyle: CSSProperties = {
  alignItems: 'center',
  borderRadius: '999px',
  display: 'inline-flex',
  height: '3.5rem',
  justifyContent: 'center',
  margin: '0 auto',
  width: '3.5rem',
};

const mobileHeroTitleStyle: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.15,
  margin: 0,
};

const mobileHeroPointsStyle: CSSProperties = {
  fontSize: '2.25rem',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 800,
  lineHeight: 1,
  margin: 0,
};

const mobileHeroHintStyle: CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: 1.4,
  margin: 0,
  opacity: 0.85,
};

const mobileHeroMetaItemStyle: CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  opacity: 0.85,
};

const mobileHeroMetaRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
};

const mobileQuestionLabelStyle: CSSProperties = {
  color: uiThemeTokens.color.text.soft,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const mobileQuestionTextStyle: CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 600,
  lineHeight: 1.35,
  margin: 0,
};

function buildMobileHeroStyle(state: 'correct' | 'incorrect' | 'no-answer'): CSSProperties {
  if (state === 'no-answer') {
    return {
      ...mobileHeroBaseStyle,
      background: 'var(--mantine-color-gray-1)',
      border: '1px solid var(--mantine-color-gray-4)',
      color: 'var(--mantine-color-gray-9)',
    };
  }
  const isCorrect = state === 'correct';
  return {
    ...mobileHeroBaseStyle,
    background: isCorrect ? 'var(--mantine-color-teal-1)' : 'var(--mantine-color-yellow-1)',
    border: `1px solid ${isCorrect ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-yellow-4)'}`,
    color: isCorrect ? 'var(--mantine-color-teal-9)' : 'var(--mantine-color-yellow-9)',
  };
}

function buildMobileHeroIconWrapperStyle(
  state: 'correct' | 'incorrect' | 'no-answer',
): CSSProperties {
  if (state === 'no-answer') {
    return {
      ...mobileHeroIconWrapperStyle,
      background: 'var(--mantine-color-gray-6)',
      color: 'white',
    };
  }
  const isCorrect = state === 'correct';
  return {
    ...mobileHeroIconWrapperStyle,
    background: isCorrect ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-yellow-6)',
    color: 'white',
  };
}
export function PlayableChoicePlayerResultSurface({
  copy,
  onLeaveParty,
  party,
  testIdPrefix,
}: PlayableChoicePlayerResultSurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const totalStages =
    party.context?.lifecycle.totalStages ??
    (stagePosition === null || stagePosition === undefined ? 0 : stagePosition + 1);
  const result = party.context?.result;
  const currentResult = result?.current;
  const currentPlayerResult = result?.currentPlayer;
  const currentPlayerTotalScore = party.players.find(
    (player) => player.isCurrentPlayer,
  )?.totalScore;
  const previousScores = usePartyStageScoreboardSnapshot(party.players, stagePosition);

  if (!currentResult || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  const progressText = t('game.party.route.runtimeStageProgress', {
    current: String(stagePosition + 1),
    total: String(totalStages),
  });

  const totalScoreText =
    currentPlayerTotalScore !== undefined
      ? t('game.party.route.runtimeTotalScore', { score: String(currentPlayerTotalScore) })
      : null;

  const tilesGrid = (
    <MotionStagger>
      <ResponsiveGrid columns={{ base: 2 }} gap={isMobile ? 'sm' : 'md'}>
        {currentResult.actions.map((action, index) => {
          const isSelected = currentPlayerResult?.selectedActionId === action.id;
          return (
            <MotionStaggerItem key={action.id}>
              <PlayableChoiceResultActionTile
                actionCount={action.actionCount}
                actionPercent={action.actionPercent}
                copy={copy}
                index={index}
                isCorrect={action.isCorrect}
                isSelected={isSelected}
                slotCount={currentResult.actions.length}
                text={action.text}
              />
            </MotionStaggerItem>
          );
        })}
      </ResponsiveGrid>
    </MotionStagger>
  );

  const heroState: 'correct' | 'incorrect' | 'no-answer' = currentPlayerResult
    ? currentPlayerResult.isCorrect
      ? 'correct'
      : 'incorrect'
    : 'no-answer';
  const heroTitle =
    heroState === 'correct'
      ? t(copy.resultCorrect)
      : heroState === 'incorrect'
        ? t(copy.resultIncorrect)
        : t(copy.resultNoAnswer);
  const heroIconName =
    heroState === 'correct' ? 'success' : heroState === 'incorrect' ? 'error' : 'pending';
  const heroHint =
    heroState === 'incorrect'
      ? t(copy.resultIncorrectHint)
      : heroState === 'no-answer'
        ? t(copy.resultNoAnswerHint)
        : null;
  const pointsText = currentPlayerResult
    ? t(copy.pointsAwarded, { points: String(currentPlayerResult.earnedPoints) })
    : null;

  const heroBlock = (
    <MotionFadeIn duration={0.4}>
      <div style={buildMobileHeroStyle(heroState)}>
        <div aria-hidden style={buildMobileHeroIconWrapperStyle(heroState)}>
          <AppIcon name={heroIconName} size={36} stroke={2} />
        </div>

        <p style={mobileHeroTitleStyle}>{heroTitle}</p>

        {pointsText ? <p style={mobileHeroPointsStyle}>{pointsText}</p> : null}

        {heroHint ? <p style={mobileHeroHintStyle}>{heroHint}</p> : null}

        <div style={mobileHeroMetaRowStyle}>
          <span style={mobileHeroMetaItemStyle}>{progressText}</span>
          {totalScoreText ? <span style={mobileHeroMetaItemStyle}>{totalScoreText}</span> : null}
        </div>
      </div>
    </MotionFadeIn>
  );

  if (isMobile) {
    return (
      <div data-testid={`${testIdPrefix}-player-result-surface`} style={mobileRootStyle}>
        <PlayerRuntimeMobileMenu
          ariaLabel={t('game.party.player.route.stageMenuLabel')}
          cancelLeaveLabel={t('game.party.player.route.cancelLeavePartyCta')}
          confirmLeaveLabel={t('game.party.player.route.confirmLeavePartyCta')}
          leaveDialogMessage={t('game.party.player.route.leavePartyConfirmMessage')}
          leaveDialogTitle={t('game.party.player.route.leavePartyConfirmTitle')}
          leaveLabel={t('game.party.player.route.leavePartyCta')}
          menuLabel={progressText}
          onLeaveParty={onLeaveParty}
        />

        <ContentStack gap="md">
          {heroBlock}

          <InsetPanel padding="md">
            <ContentStack gap="sm">
              <span style={mobileQuestionLabelStyle}>{t(copy.resultHeading)}</span>
              <p style={mobileQuestionTextStyle}>{currentResult.text}</p>
              {tilesGrid}
            </ContentStack>
          </InsetPanel>

          <PartyStandingsList
            isMobile={isMobile}
            players={party.players}
            previousScores={previousScores}
            testIdPrefix={`${testIdPrefix}-stage-result-rankings`}
            totalStages={totalStages}
            title={t('game.party.route.stageResultsStandingsTitle')}
          />
        </ContentStack>
      </div>
    );
  }

  return (
    <div data-testid={`${testIdPrefix}-player-result-surface`}>
      <ContentStack gap="lg">
        <PlayerPartyStatusBar
          onLeaveParty={onLeaveParty}
          pausedText={t(copy.paused)}
          party={party}
          variant="paused-only"
        />

        {heroBlock}

        <InsetPanel padding="lg">
          <ContentStack gap="md">
            <Heading level={3}>{currentResult.text}</Heading>
            {tilesGrid}
          </ContentStack>
        </InsetPanel>

        <PartyStandingsList
          isMobile={isMobile}
          players={party.players}
          previousScores={previousScores}
          testIdPrefix={`${testIdPrefix}-stage-result-rankings`}
          totalStages={totalStages}
          title={t('game.party.route.stageResultsStandingsTitle')}
        />
      </ContentStack>
    </div>
  );
}
