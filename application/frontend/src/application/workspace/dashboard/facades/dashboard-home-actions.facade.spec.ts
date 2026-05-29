import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import type { GameTypeRegistry } from '../../../game/types/shared/services/game-type-registry';
import { ProjectIdentifier } from '../../shared/services/identifiers/project-identifier';
import { DashboardHomeActionsFacade } from './dashboard-home-actions.facade';

const projectIdentifier = new ProjectIdentifier();
const acceptedTypesResolver = { resolve: vi.fn().mockReturnValue('.csv,text/csv') } as never;

describe('DashboardHomeActionsFacade', () => {
  it('delegates manage-game route resolution to the game type registry', () => {
    const gameTypeRegistry = {
      resolveManagementRoute: vi.fn().mockReturnValue('/quizzes/12'),
      createGame: vi.fn(),
      createGameFromImport: vi.fn(),
      getImportExampleProvider: vi.fn(),
      resolveManagementRouteByType: vi.fn(),
    } as unknown as GameTypeRegistry;
    const facade = new DashboardHomeActionsFacade(gameTypeRegistry, acceptedTypesResolver);

    expect(facade.resolveManageGameRoute({ type: 'quiz', gameTypeId: 12 } as never)).toBe(
      '/quizzes/12',
    );
    expect(gameTypeRegistry.resolveManagementRoute).toHaveBeenCalledWith({
      type: 'quiz',
      gameTypeId: 12,
    });
  });

  it('returns the organizations route', () => {
    const facade = new DashboardHomeActionsFacade(
      {
        resolveManagementRoute: vi.fn(),
        resolveManagementRouteByType: vi.fn(),
        createGame: vi.fn(),
        createGameFromImport: vi.fn(),
        getImportExampleProvider: vi.fn(),
      } as never,
      acceptedTypesResolver,
    );

    expect(facade.resolveOrganizationsRoute()).toBe('/workspace/organizations');
  });

  it('returns the projects route', () => {
    const facade = new DashboardHomeActionsFacade(
      {
        resolveManagementRoute: vi.fn(),
        resolveManagementRouteByType: vi.fn(),
        createGame: vi.fn(),
        createGameFromImport: vi.fn(),
        getImportExampleProvider: vi.fn(),
      } as never,
      acceptedTypesResolver,
    );

    expect(facade.resolveProjectsRoute()).toBe('/workspace/organizations#projects');
  });

  it('creates quiz games and returns the management route', async () => {
    const gameTypeRegistry = {
      resolveManagementRoute: vi.fn(),
      createGame: vi.fn().mockResolvedValue(18),
      createGameFromImport: vi.fn(),
      getImportExampleProvider: vi.fn(),
      resolveManagementRouteByType: vi.fn().mockReturnValue('/quizzes/18'),
    } as unknown as GameTypeRegistry;
    const facade = new DashboardHomeActionsFacade(gameTypeRegistry, acceptedTypesResolver);
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

  it('creates a game from import and returns the imported count with the management route', async () => {
    const gameTypeRegistry = {
      resolveManagementRoute: vi.fn(),
      createGame: vi.fn(),
      createGameFromImport: vi.fn().mockResolvedValue({ gameTypeId: 18, importedCount: 6 }),
      getImportExampleProvider: vi.fn(),
      resolveManagementRouteByType: vi.fn().mockReturnValue('/quizzes/18'),
    } as unknown as GameTypeRegistry;
    const facade = new DashboardHomeActionsFacade(gameTypeRegistry, acceptedTypesResolver);
    const projectId = projectIdentifier.parse(4);
    const importFile = new File(['[]'], 'questions.json', { type: 'application/json' });

    const result = await facade.createGameFromImport({
      type: GameType.Quiz,
      projectId,
      title: 'Sprint quiz',
      description: null,
      file: importFile,
    });

    expect(gameTypeRegistry.createGameFromImport).toHaveBeenCalledWith(GameType.Quiz, projectId, {
      title: 'Sprint quiz',
      description: null,
      file: importFile,
    });
    expect(gameTypeRegistry.createGame).not.toHaveBeenCalled();
    expect(gameTypeRegistry.resolveManagementRouteByType).toHaveBeenCalledWith(GameType.Quiz, 18);
    expect(result).toEqual({ importedCount: 6, route: '/quizzes/18' });
  });

  it('returns the import example provider from the game type registry', () => {
    const exampleProvider = {
      create: vi.fn(),
      listFormats: vi.fn().mockReturnValue([]),
    };
    const facade = new DashboardHomeActionsFacade(
      {
        resolveManagementRoute: vi.fn(),
        resolveManagementRouteByType: vi.fn(),
        createGame: vi.fn(),
        createGameFromImport: vi.fn(),
        getImportExampleProvider: vi.fn().mockReturnValue(exampleProvider),
      } as never,
      acceptedTypesResolver,
    );

    expect(facade.getImportExampleProvider(GameType.Prediction)).toBe(exampleProvider);
  });
});
