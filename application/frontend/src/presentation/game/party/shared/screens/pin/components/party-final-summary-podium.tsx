import type { PartyObservationPlayer } from '../../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import {
  MOBILE_PODIUM_LAYOUT_ORDER,
  PODIUM_LAYOUT_ORDER,
  type PodiumRank,
  toPartyFinalSummaryPlayerKey,
} from './party-final-summary-panel.model';
import {
  buildPodiumAvatarStyle,
  buildPodiumBadgeStyle,
  buildPodiumColumnStyle,
  buildPodiumMobileCardStyle,
  mobileWinnerCardStyle,
  mobileWinnerHeaderStyle,
  mobileWinnerNameStyle,
  mobileWinnerScoreStyle,
  podiumCrownStyle,
  podiumDesktopRackStyle,
  podiumHeaderStyle,
  podiumMobileCardHeaderStyle,
  podiumMobileIdentityStyle,
  podiumMobileListStyle,
  podiumMobileNameGroupStyle,
  podiumMobileRankGroupStyle,
  podiumMobileScoreStyle,
  podiumMobileSecondaryListStyle,
  podiumPointsStyle,
  podiumSectionStyle,
  podiumUsernameStyle,
} from './party-final-summary-panel.styles';

interface PartyFinalSummaryPodiumProps {
  readonly isMobile: boolean;
  readonly podiumByRank: ReadonlyMap<PodiumRank, PartyObservationPlayer>;
  readonly winner: PartyObservationPlayer | null;
}

export function PartyFinalSummaryPodium({
  isMobile,
  podiumByRank,
  winner,
}: PartyFinalSummaryPodiumProps) {
  const { t } = usePresentationTranslation();

  return (
    <ElevatedPanel padding={isMobile ? 'md' : 'lg'}>
      <div style={podiumSectionStyle}>
        <ContentStack gap="lg">
          <div style={podiumHeaderStyle}>
            <Heading level={2}>{t('game.party.route.finalSummaryPodiumTitle')}</Heading>
            <SupportingText tone="soft">
              {t('game.party.route.finalSummaryPodiumHint')}
            </SupportingText>
          </div>

          {isMobile ? (
            <div data-testid="party-final-podium-mobile" style={podiumMobileListStyle}>
              {winner ? renderMobileWinnerEntry(winner, t) : null}
              <div style={podiumMobileSecondaryListStyle}>
                {MOBILE_PODIUM_LAYOUT_ORDER.filter((rank) => rank !== 1).map((rank) => {
                  const player = podiumByRank.get(rank);

                  if (!player) {
                    return null;
                  }

                  return renderMobilePodiumEntry(player, rank, t);
                })}
              </div>
            </div>
          ) : (
            <div data-testid="party-final-podium-desktop" style={podiumDesktopRackStyle}>
              {PODIUM_LAYOUT_ORDER.map((rank) => {
                const player = podiumByRank.get(rank);

                if (!player) {
                  return null;
                }

                return renderDesktopPodiumEntry(player, rank, t);
              })}
            </div>
          )}
        </ContentStack>
      </div>
    </ElevatedPanel>
  );
}

function renderDesktopPodiumEntry(
  player: PartyObservationPlayer,
  rank: PodiumRank,
  t: ReturnType<typeof usePresentationTranslation>['t'],
) {
  const avatarSize = rank === 1 ? 96 : 72;

  return (
    <div
      key={toPartyFinalSummaryPlayerKey(player)}
      data-testid={`party-final-podium-rank-${rank}`}
      style={buildPodiumColumnStyle(rank)}
    >
      {rank === 1 ? (
        <span aria-hidden="true" style={podiumCrownStyle}>
          👑
        </span>
      ) : null}
      <UserAvatar
        alt={t('game.party.route.finalSummaryAvatarAlt', {
          username: player.username,
        })}
        size={avatarSize}
        src={player.avatarUri}
        style={buildPodiumAvatarStyle(rank)}
      />
      <div style={buildPodiumBadgeStyle(rank)}>{rank}</div>
      <p style={podiumUsernameStyle}>{player.username}</p>
      <p style={podiumPointsStyle}>
        {t('game.party.route.finalLeaderboardScore', {
          points: String(player.totalScore),
        })}
      </p>
      {player.isCurrentPlayer ? (
        <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
      ) : null}
    </div>
  );
}

function renderMobilePodiumEntry(
  player: PartyObservationPlayer,
  rank: PodiumRank,
  t: ReturnType<typeof usePresentationTranslation>['t'],
) {
  return (
    <div
      key={`mobile-${toPartyFinalSummaryPlayerKey(player)}`}
      data-testid={`party-final-podium-mobile-rank-${rank}`}
      style={buildPodiumMobileCardStyle(rank)}
    >
      <div style={podiumMobileCardHeaderStyle}>
        <div style={podiumMobileRankGroupStyle}>
          <div style={buildPodiumBadgeStyle(rank)}>{rank}</div>
        </div>
        <p style={podiumMobileScoreStyle}>
          {t('game.party.route.finalLeaderboardScore', {
            points: String(player.totalScore),
          })}
        </p>
      </div>
      <div style={podiumMobileIdentityStyle}>
        <UserAvatar
          alt={t('game.party.route.finalSummaryAvatarAlt', {
            username: player.username,
          })}
          size={56}
          src={player.avatarUri}
          style={buildPodiumAvatarStyle(rank)}
        />
        <div style={podiumMobileNameGroupStyle}>
          <p style={podiumUsernameStyle}>{player.username}</p>
          {player.isCurrentPlayer ? (
            <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function renderMobileWinnerEntry(
  player: PartyObservationPlayer,
  t: ReturnType<typeof usePresentationTranslation>['t'],
) {
  return (
    <div
      data-testid="party-final-mobile-winner"
      key={`mobile-winner-${toPartyFinalSummaryPlayerKey(player)}`}
      style={mobileWinnerCardStyle}
    >
      <div style={mobileWinnerHeaderStyle}>
        <span aria-hidden="true" style={podiumCrownStyle}>
          👑
        </span>
        <div style={buildPodiumBadgeStyle(1)}>1</div>
      </div>
      <UserAvatar
        alt={t('game.party.route.finalSummaryAvatarAlt', {
          username: player.username,
        })}
        size={88}
        src={player.avatarUri}
        style={buildPodiumAvatarStyle(1)}
      />
      <p style={mobileWinnerNameStyle}>{player.username}</p>
      <p style={mobileWinnerScoreStyle}>
        {t('game.party.route.finalLeaderboardScore', {
          points: String(player.totalScore),
        })}
      </p>
      {player.isCurrentPlayer ? (
        <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
      ) : null}
    </div>
  );
}
