import type { LeaderboardEntry } from '../../../../../../../domains/game-session/entities/leaderboard-entry';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import {
  getPodiumColumnStyle,
  podiumAvatarStyle,
  podiumCrownStyle,
  podiumPointsLabelStyle,
  podiumPointsStyle,
  podiumRankBadgeStyle,
  podiumUsernameStyle,
} from '../leaderboard-styles';

interface LeaderboardPodiumCardProps {
  readonly avatarUri?: string | null;
  readonly entry: LeaderboardEntry;
  readonly isCurrentPlayer: boolean;
}

export function LeaderboardPodiumCard({
  avatarUri,
  entry,
  isCurrentPlayer,
}: LeaderboardPodiumCardProps) {
  const { t } = usePresentationTranslation();
  const rank = entry.rank as 1 | 2 | 3;
  const avatarSize = rank === 1 ? 88 : 64;

  return (
    <div style={getPodiumColumnStyle(rank)}>
      {rank === 1 ? (
        <span style={podiumCrownStyle} aria-hidden="true">
          👑
        </span>
      ) : null}
      <UserAvatar
        alt={entry.username}
        size={avatarSize}
        src={avatarUri}
        style={podiumAvatarStyle(rank)}
      />
      <div style={podiumRankBadgeStyle(rank)}>{rank}</div>
      <p style={podiumUsernameStyle(rank)}>{entry.username}</p>
      <p style={podiumPointsStyle}>{entry.totalPoints}</p>
      <p style={podiumPointsLabelStyle}>
        {t('game.leaderboard.pointsLabel', { points: String(entry.totalPoints) })}
      </p>

      {isCurrentPlayer ? <Badge tone="success">{t('game.leaderboard.youBadge')}</Badge> : null}

      {rank === 1 ? (
        <p
          style={{
            color: 'rgba(184,255,92,0.7)',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {t('game.leaderboard.winnerLabel')}
        </p>
      ) : (
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {t('game.leaderboard.rankLabel', { rank: String(entry.rank) })}
        </p>
      )}
    </div>
  );
}
