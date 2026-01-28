import { useEffect, useState } from 'react';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../shared/routing/game-session-route-context';
import { usePresentationNavigate } from '../../../shared/routing/router';
import { Button } from '../../../shared/ui/actions/button';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { Tooltip } from '../../../shared/ui/overlay/tooltip';

interface LaunchGameSessionButtonProps {
  readonly createGameSession: (gameId: number) => Promise<DashboardActiveSessionItem>;
  readonly gameId: number;
  readonly loadActiveSessions: () => Promise<DashboardActiveSessionItem[]>;
}

export function LaunchGameSessionButton({
  createGameSession,
  gameId,
  loadActiveSessions,
}: LaunchGameSessionButtonProps) {
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { resolveLobbyRoute } = useGameSessionRoutes();
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const sessions = await loadActiveSessions();

        if (!ignore) {
          setHasActiveSession(sessions.length > 0);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [loadActiveSessions]);

  const handleLaunch = async () => {
    setIsLaunching(true);

    try {
      const created = await createGameSession(gameId);
      navigate(resolveLobbyRoute(created.pin));
    } catch {
      setIsLaunching(false);
    }
  };

  const isDisabled = isLoading || isLaunching || hasActiveSession;

  return (
    <Tooltip
      disabled={!hasActiveSession}
      label={t('dashboard.games.actions.launchDisabledActiveSession')}
      withArrow
    >
      <span style={{ display: 'inline-block' }}>
        <Button
          disabled={isDisabled}
          intent="primary"
          leftSection={<AppIcon name="play" size={14} />}
          onClick={() => void handleLaunch()}
          size="sm"
        >
          {isLaunching
            ? t('dashboard.games.actions.launching')
            : t('dashboard.games.actions.launch')}
        </Button>
      </span>
    </Tooltip>
  );
}
