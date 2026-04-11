import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import type { GameTypeRegistry } from '../../../game/types/shared/services/game-type-registry';
import { ProjectIdentifier } from '../../shared/services/identifiers/project-identifier';
import { DashboardHomeActionsFacade } from './dashboard-home-actions.facade';

const projectIdentifier = new ProjectIdentifier();

describe('DashboardHomeActionsFacade', () => {
  it('delegates manage-game route resolution to the game type registry', () => {
    const gameTypeRegistry = {
      resolveManagementRoute: vi.fn().mockReturnValue('/quizzes/12'),
      createGame: vi.fn(),
      resolveManagementRouteByType: vi.fn(),
    } as unknown as GameTypeRegistry;
    const facade = new DashboardHomeActionsFacade(gameTypeRegistry);

    expect(facade.resolveManageGameRoute({ type: 'quiz', gameTypeId: 12 } as never)).toBe(
      '/quizzes/12',
    );
    expect(gameTypeRegistry.resolveManagementRoute).toHaveBeenCalledWith({
      type: 'quiz',
      gameTypeId: 12,
    });
  });

  it('returns the organizations route', () => {
    const facade = new DashboardHomeActionsFacade({
      resolveManagementRoute: vi.fn(),
      resolveManagementRouteByType: vi.fn(),
      createGame: vi.fn(),
    } as never);

    expect(facade.resolveOrganizationsRoute()).toBe('/workspace/organizations');
  });

  it('returns the projects route', () => {
    const facade = new DashboardHomeActionsFacade({
      resolveManagementRoute: vi.fn(),
      resolveManagementRouteByType: vi.fn(),
      createGame: vi.fn(),
    } as never);

    expect(facade.resolveProjectsRoute()).toBe('/workspace/organizations#projects');
  });

  it('creates quiz games and returns the management route', async () => {
    const gameTypeRegistry = {
      resolveManagementRoute: vi.fn(),
      createGame: vi.fn().mockResolvedValue(18),
      resolveManagementRouteByType: vi.fn().mockReturnValue('/quizzes/18'),
    } as unknown as GameTypeRegistry;
    const facade = new DashboardHomeActionsFacade(gameTypeRegistry);
    const projectId = projectIdentifier.parse(4);

    const result = await facade.createGame({
      type: GameType.Quiz,
      projectId,
      title: 'Sprint quiz',
      description: null,
    });

    expect(gameTypeRegistry.createGame).toHaveBeenCalledWith(GameType.Quiz, projectId, {
      title: 'Sprint quiz',
      description: null,
    });
    expect(gameTypeRegistry.resolveManagementRouteByType).toHaveBeenCalledWith(GameType.Quiz, 18);
    expect(result).toBe('/quizzes/18');
  });
});
