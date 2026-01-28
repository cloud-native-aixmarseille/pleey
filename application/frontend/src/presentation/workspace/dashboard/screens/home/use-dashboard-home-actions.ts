import { useState } from 'react';
import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardGameListItem } from '../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardActiveSessionItem } from '../../../../../domains/game-session/entities/active-game-session';

interface UseDashboardHomeActionsParams {
  readonly actionsFacade: DashboardHomeActionsFacade;
  readonly navigate: (to: string) => void;
}

export function useDashboardHomeActions({
  actionsFacade,
  navigate,
}: UseDashboardHomeActionsParams) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchErrorMessage, setLaunchErrorMessage] = useState<string | null>(null);

  const handleOpenSession = (session: DashboardActiveSessionItem) => {
    navigate(actionsFacade.resolveOpenSessionRoute(session));
  };

  const handleManageGame = (game: DashboardGameListItem) => {
    const route = actionsFacade.resolveManageGameRoute(game);
    if (route) {
      navigate(route);
    }
  };

  const handleLaunchSession = async (game: DashboardGameListItem) => {
    setLaunchErrorMessage(null);
    setIsLaunching(true);

    try {
      navigate(await actionsFacade.launchSessionRoute(game.gameId));
    } catch (error) {
      setLaunchErrorMessage(
        error instanceof Error ? error.message : 'dashboard.sessions.createFailed',
      );
    } finally {
      setIsLaunching(false);
    }
  };

  const handleManageOrganizations = () => {
    navigate(actionsFacade.resolveOrganizationsRoute());
  };

  const handleManageProjects = () => {
    navigate(actionsFacade.resolveProjectsRoute());
  };

  return {
    isLaunching,
    launchErrorMessage,
    handleOpenSession,
    handleManageGame,
    handleLaunchSession,
    handleManageOrganizations,
    handleManageProjects,
  };
}
