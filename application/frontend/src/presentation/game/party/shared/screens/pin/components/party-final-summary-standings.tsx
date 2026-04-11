import type { PartyObservationPlayer } from '../../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { ContentStack, SplitWrapRow } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel, InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../../shared/ui/layout/typography';
import { toPartyFinalSummaryPlayerKey } from './party-final-summary-panel.model';
import {
  mobileStandingsIdentityStyle,
  mobileStandingsNameGroupStyle,
  mobileStandingsRowStyle,
  mobileStandingsTopStyle,
  standingsBodyStyle,
  standingsListStyle,
  standingsRankStyle,
  standingsRowStyle,
  standingsUsernameStyle,
} from './party-final-summary-panel.styles';

interface PartyFinalSummaryStandingsProps {
  readonly isMobile: boolean;
  readonly players: readonly PartyObservationPlayer[];
}

export function PartyFinalSummaryStandings({ isMobile, players }: PartyFinalSummaryStandingsProps) {
  const { t } = usePresentationTranslation();

  return (
    <ElevatedPanel padding={isMobile ? 'md' : 'lg'}>
      <ContentStack gap="md">
        <SplitWrapRow align="baseline" gap="md">
          <Heading level={2}>{t('game.party.route.finalSummaryStandingsTitle')}</Heading>
          <Badge tone="accent">{players.length}</Badge>
        </SplitWrapRow>

        <ol data-testid="party-final-standings" style={standingsListStyle}>
          {players.map((player, index) => {
            const rank = index + 1;

            return (
              <li key={toPartyFinalSummaryPlayerKey(player)}>
                {renderStandingsEntry(player, rank, t, isMobile)}
              </li>
            );
          })}
        </ol>
      </ContentStack>
    </ElevatedPanel>
  );
}

function renderStandingsEntry(
  player: PartyObservationPlayer,
  rank: number,
  t: ReturnType<typeof usePresentationTranslation>['t'],
  isMobile: boolean,
) {
  if (isMobile) {
    return (
      <InsetPanel padding="md" tone={player.isCurrentPlayer ? 'accent' : 'default'}>
        <div data-testid={`party-final-standings-rank-${rank}`} style={mobileStandingsRowStyle}>
          <div style={mobileStandingsTopStyle}>
            <Badge tone="neutral">#{rank}</Badge>
            <Badge tone="accent">
              {t('game.party.route.finalLeaderboardScore', {
                points: String(player.totalScore),
              })}
            </Badge>
          </div>
          <div style={mobileStandingsIdentityStyle}>
            <UserAvatar
              alt={t('game.party.route.finalSummaryAvatarAlt', {
                username: player.username,
              })}
              size={40}
              src={player.avatarUri}
            />
            <div style={mobileStandingsNameGroupStyle}>
              <p style={standingsUsernameStyle}>{player.username}</p>
              {player.isCurrentPlayer ? (
                <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </InsetPanel>
    );
  }

  return (
    <InsetPanel padding="md" tone={player.isCurrentPlayer ? 'accent' : 'default'}>
      <div data-testid={`party-final-standings-rank-${rank}`} style={standingsRowStyle}>
        <span style={standingsRankStyle}>#{rank}</span>
        <div style={standingsBodyStyle}>
          <UserAvatar
            alt={t('game.party.route.finalSummaryAvatarAlt', {
              username: player.username,
            })}
            size={44}
            src={player.avatarUri}
          />
          <p style={standingsUsernameStyle}>{player.username}</p>
          {player.isCurrentPlayer ? (
            <Badge tone="success">{t('game.party.route.youBadge')}</Badge>
          ) : null}
        </div>
        <Badge tone="accent">
          {t('game.party.route.finalLeaderboardScore', {
            points: String(player.totalScore),
          })}
        </Badge>
      </div>
    </InsetPanel>
  );
}
