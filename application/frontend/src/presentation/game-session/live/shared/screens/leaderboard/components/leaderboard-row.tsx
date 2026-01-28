import type { LeaderboardEntry } from '../../../../../../../domains/game-session/entities/leaderboard-entry';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import {
  rankingAvatarStyle,
  rankingNameGroupStyle,
  rankingNameStyle,
  rankingPointsStyle,
  rankingPositionStyle,
  rankingRowStyle,
} from '../leaderboard-styles';

interface LeaderboardRowProps {
  readonly avatarUri?: string | null;
  readonly entry: LeaderboardEntry;
  readonly isCurrentPlayer: boolean;
}

export function LeaderboardRow({ avatarUri, entry, isCurrentPlayer }: LeaderboardRowProps) {
  const { t } = usePresentationTranslation();

  return (
    <div style={rankingRowStyle(isCurrentPlayer)}>
      <p style={rankingPositionStyle}>
        {t('game.leaderboard.rankLabel', { rank: String(entry.rank) })}
      </p>
      <div style={rankingNameGroupStyle}>
        <UserAvatar alt={entry.username} size={40} src={avatarUri} style={rankingAvatarStyle} />
        <p style={rankingNameStyle}>{entry.username}</p>
        {isCurrentPlayer ? <Badge tone="success">{t('game.leaderboard.youBadge')}</Badge> : null}
      </div>
      <p style={rankingPointsStyle}>
        {t('game.leaderboard.pointsLabel', { points: String(entry.totalPoints) })}
      </p>
    </div>
  );
}
