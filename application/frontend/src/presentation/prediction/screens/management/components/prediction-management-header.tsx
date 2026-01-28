import type { DashboardGameListItem } from '../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardActiveSessionItem } from '../../../../../domains/game-session/entities/active-game-session';
import { LaunchGameSessionButton } from '../../../../game-session/shared/components/launch-game-session-button';
import { Button } from '../../../../shared/ui/actions/button';
import { SubpageHeader } from '../../../../shared/ui/layout/subpage-header';

interface PredictionManagementHeaderProps {
  readonly backActionLabel: string;
  readonly createGameSession: (gameId: number) => Promise<DashboardActiveSessionItem>;
  readonly eyebrow: string;
  readonly game: DashboardGameListItem;
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
  readonly onBack: () => void;
  readonly subtitle: string;
  readonly title: string;
}

export function PredictionManagementHeader({
  backActionLabel,
  createGameSession,
  eyebrow,
  game,
  loadActiveSessions,
  onBack,
  subtitle,
  title,
}: PredictionManagementHeaderProps) {
  return (
    <SubpageHeader
      kicker={eyebrow}
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <LaunchGameSessionButton
            createGameSession={createGameSession}
            gameId={game.gameId}
            loadActiveSessions={loadActiveSessions}
          />
          <Button intent="ghost" onClick={onBack}>
            {backActionLabel}
          </Button>
        </>
      }
    />
  );
}
