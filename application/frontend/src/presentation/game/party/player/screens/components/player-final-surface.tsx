import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { PrimaryActionLink } from '../../../../../shared/ui/navigation/links';
import { PartyFinalSummaryPanel } from '../../../shared/screens/components/party-final-summary-panel';
import { createPartyFinalSummaryModel } from '../../../shared/screens/components/party-final-summary-panel.model';
import { PlayerPartyStatusBar } from './player-party-status-bar';

interface PlayerFinalSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

export function PlayerFinalSurface({ onLeaveParty, party }: PlayerFinalSurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const { currentPlayer, currentPlayerRank } = createPartyFinalSummaryModel(party.players);
  const shouldPromptGuestSignIn = currentPlayer?.identity.kind === PartyPlayerIdentityKind.Guest;

  return (
    <div data-testid="player-final-surface">
      <ContentStack gap={isMobile ? 'md' : 'lg'}>
        <PlayerPartyStatusBar onLeaveParty={onLeaveParty} party={party} variant="final" />

        {currentPlayer && currentPlayerRank !== null ? (
          <section data-testid="player-final-result-card">
            <InsetPanel padding={isMobile ? 'md' : 'lg'} tone="accent">
              <ContentStack gap={isMobile ? 'sm' : 'md'}>
                <SplitWrapRow align="center" gap="sm">
                  <SupportingText tone="soft">
                    {t('game.party.player.route.finalResultTitle')}
                  </SupportingText>

                  <WrapRow gap="xs">
                    <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
                    <Badge icon={<AppIcon name="trophy" size={12} />} tone="neutral">
                      #{currentPlayerRank}
                    </Badge>
                    <Badge tone="accent">
                      {t('game.party.route.finalLeaderboardScore', {
                        points: String(currentPlayer.totalScore),
                      })}
                    </Badge>
                  </WrapRow>
                </SplitWrapRow>

                <WrapRow gap="sm">
                  <UserAvatar
                    alt={t('game.party.route.finalSummaryAvatarAlt', {
                      username: currentPlayer.username,
                    })}
                    size={isMobile ? 56 : 64}
                    src={currentPlayer.avatarUri}
                  />
                  <Heading level={isMobile ? 3 : 2}>{currentPlayer.username}</Heading>
                </WrapRow>
              </ContentStack>
            </InsetPanel>
          </section>
        ) : null}

        <PartyFinalSummaryPanel
          players={party.players}
          totalStages={party.context?.lifecycle.totalStages ?? 0}
        />

        {shouldPromptGuestSignIn ? (
          <InsetPanel padding={isMobile ? 'md' : 'lg'} tone="accent">
            <ContentStack gap="sm">
              <Heading level={3}>{t('game.party.player.route.saveScorePromptTitle')}</Heading>
              <SupportingText>{t('game.party.player.route.saveScorePromptMessage')}</SupportingText>
              <PrimaryActionLink
                leftSection={<AppIcon aria-hidden name="sign-in" size={16} />}
                to="/identity/sign-in"
              >
                {t('game.party.player.route.saveScorePromptCta')}
              </PrimaryActionLink>
            </ContentStack>
          </InsetPanel>
        ) : null}
      </ContentStack>
    </div>
  );
}
