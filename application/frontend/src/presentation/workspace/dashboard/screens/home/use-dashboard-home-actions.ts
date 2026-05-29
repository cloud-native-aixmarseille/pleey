import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import { usePresentationNavigate } from '../../../../shared/routing/router';

interface UseDashboardHomeActionsParams {
  readonly actionsFacade: DashboardHomeActionsFacade;
}

interface CreateDashboardGameCommand {
  readonly description: string | null;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly type: GameType;
}

interface ImportDashboardGameCommand {
  readonly description: string | null;
  readonly file: File;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly type: GameType;
}

export function useDashboardHomeActions({ actionsFacade }: UseDashboardHomeActionsParams) {
  const navigate = usePresentationNavigate();

  const handleManageGame = (game: DashboardGameListItem) => {
    const route = actionsFacade.resolveManageGameRoute(game);
    if (route) {
      navigate(route);
    }
  };

  const handleManageOrganizations = () => {
    navigate(actionsFacade.resolveOrganizationsRoute());
  };

  const handleManageProjects = () => {
    navigate(actionsFacade.resolveProjectsRoute());
  };

  const handleCreateGame = async (command: CreateDashboardGameCommand) => {
    const route = await actionsFacade.createGame(command);

    if (route) {
      navigate(route);
    }
  };

  const handleCreateGameFromImport = async (
    command: ImportDashboardGameCommand,
  ): Promise<number> => {
    const result = await actionsFacade.createGameFromImport(command);

    if (result.route) {
      navigate(result.route);
    }

    return result.importedCount;
  };

  return {
    handleCreateGame,
    handleCreateGameFromImport,
    handleManageGame,
    handleManageOrganizations,
    handleManageProjects,
  };
}
