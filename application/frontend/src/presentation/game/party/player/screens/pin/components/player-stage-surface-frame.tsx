import type { ReactNode } from 'react';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import { MotionFadeIn, MotionPresence } from '../../../../../../shared/ui/motion/motion-primitives';
import { PlayerPartyStatusBar } from './player-party-status-bar';

interface PlayerStageSurfaceFrameProps {
  readonly children: ReactNode;
  readonly contentGap?: 'sm' | 'md' | 'lg';
  readonly isLocked: boolean;
  readonly isSubmitting: boolean;
  readonly lockedLabel: string;
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
  readonly playerActionErrorMessage: string | null;
  readonly stageAside?: ReactNode;
  readonly submittingLabel: string;
  readonly testId: string;
}

export function PlayerStageSurfaceFrame({
  children,
  contentGap = 'md',
  isLocked,
  isSubmitting,
  lockedLabel,
  onLeaveParty,
  party,
  playerActionErrorMessage,
  stageAside,
  submittingLabel,
  testId,
}: PlayerStageSurfaceFrameProps) {
  const { t } = usePresentationTranslation();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const currentStage = party.context?.stage?.current;

  if (!currentStage || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  return (
    <div data-testid={testId}>
      <ContentStack gap="lg">
        <PlayerPartyStatusBar onLeaveParty={onLeaveParty} party={party} variant="paused-only" />

        <MotionPresence>
          {playerActionErrorMessage ? (
            <MotionFadeIn key="player-action-error">
              <StatusBanner tone="error">{t(playerActionErrorMessage)}</StatusBanner>
            </MotionFadeIn>
          ) : null}
        </MotionPresence>

        <InsetPanel padding="md">
          <ContentStack gap={contentGap}>
            {stageAside}

            <SupportingText tone="soft">
              {t('game.party.route.runtimeStageProgress', {
                current: String(stagePosition + 1),
                total: String(party.context?.lifecycle.totalStages ?? stagePosition + 1),
              })}
            </SupportingText>

            <Heading level={3}>{currentStage.text}</Heading>

            {children}

            <MotionPresence>
              {isSubmitting ? (
                <MotionFadeIn key="submitting-banner">
                  <StatusBanner tone="success">{submittingLabel}</StatusBanner>
                </MotionFadeIn>
              ) : null}

              {isLocked ? (
                <MotionFadeIn key="locked-banner">
                  <StatusBanner tone="success">{lockedLabel}</StatusBanner>
                </MotionFadeIn>
              ) : null}
            </MotionPresence>
          </ContentStack>
        </InsetPanel>
      </ContentStack>
    </div>
  );
}
