import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { StaticGameTypeCatalogFactory } from '../../../../../app/bootstrap/modules/workspace/container';
import type { GameId } from '../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType, type GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import { ProjectIdentifier } from '../../../../workspace/shared/services/identifiers/project-identifier';
import { GameIdentifier } from '../../../shared/services/identifiers/game-identifier';
import type { GameTypeContributor } from '../contracts/game-type-contributor';
import { GameTypeIdentifier } from './game-type-identifier';
import { GameTypeRegistry } from './game-type-registry';

const gameIdentifier = new GameIdentifier();
const gameTypeIdentifier = new GameTypeIdentifier();
const projectIdentifier = new ProjectIdentifier();
const gameTypeCatalogFactory = new StaticGameTypeCatalogFactory();

describe('GameTypeRegistry', () => {
  it('lists contributed descriptors in registration order', () => {
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz', managementRoutePath: '/quizzes' }),
      createContributor({ key: 'prediction', managementRoutePath: '/predictions' }),
    ]);

    expect(registry.listCatalog().list()).toEqual([
      {
        key: 'quiz',
        badge: 'QZ',
        iconKey: 'quiz',
        titleKey: 'game.types.quiz.title',
        descriptionKey: 'game.types.quiz.description',
        managementRoutePath: '/quizzes',
      },
      {
        key: 'prediction',
        badge: 'PR',
        iconKey: 'prediction',
        titleKey: 'game.types.prediction.title',
        descriptionKey: 'game.types.prediction.description',
        managementRoutePath: '/predictions',
      },
    ]);
  });

  it('enriches games with the contributed summary', () => {
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz', summaryKey: 'game.types.quiz.management.questionSummary' }),
      createContributor({ key: 'prediction' }),
    ]);
    const games = [
      createGame({ gameId: gameIdentifier.parse(1), type: 'quiz', stageCount: 12 }),
      createGame({ gameId: gameIdentifier.parse(2), type: 'prediction', stageCount: 4 }),
    ];

    expect(registry.enrichGames(games)).toEqual([
      {
        ...games[0],
        summary: {
          translationKey: 'game.types.quiz.management.questionSummary',
          values: { count: '12' },
        },
      },
      games[1],
    ]);
  });

  it('resolves the management route from the contributed descriptor', () => {
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz', managementRoutePath: '/quizzes' }),
    ]);

    expect(
      registry.resolveManagementRoute({
        type: 'quiz',
        gameTypeId: gameTypeIdentifier.parse(24),
      }),
    ).toBe('/quizzes/24');
    expect(registry.resolveManagementRoute({ type: 'quiz', gameTypeId: null })).toBeNull();
    expect(registry.resolveManagementRouteByType('quiz', gameTypeIdentifier.parse(31))).toBe(
      '/quizzes/31',
    );
    expect(
      registry.resolveManagementRoute({
        type: 'prediction',
        gameTypeId: gameTypeIdentifier.parse(12),
      }),
    ).toBeNull();
    expect(registry.resolveManagementRouteByType('prediction', gameTypeIdentifier.parse(12))).toBe(
      null,
    );
  });

  it('delegates game creation to the contributor for the requested type', async () => {
    const createQuiz = vi.fn().mockResolvedValue(gameTypeIdentifier.parse(41));
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz', createGame: createQuiz }),
      createContributor({ key: 'prediction' }),
    ]);
    const projectId = projectIdentifier.parse(8);

    await expect(
      registry.createGame('quiz', projectId, { title: 'Sprint quiz', description: null }),
    ).resolves.toBe(gameTypeIdentifier.parse(41));
    await expect(
      registry.createGame('prediction', projectId, { title: 'Match day', description: null }),
    ).resolves.toBeNull();
    expect(createQuiz).toHaveBeenCalledWith(projectId, {
      title: 'Sprint quiz',
      description: null,
    });
  });
});

function createContributor({
  key,
  managementRoutePath,
  createGame,
  summaryKey,
}: {
  key: GameType;
  managementRoutePath?: string;
  createGame?: GameTypeContributor['createGame'];
  summaryKey?: string;
}): GameTypeContributor {
  return {
    descriptor: {
      key,
      badge: key === GameType.Quiz ? 'QZ' : 'PR',
      iconKey: key,
      titleKey: `game.types.${key}.title`,
      descriptionKey: `game.types.${key}.description`,
      managementRoutePath,
    },
    createGame,
    buildGameSummary: summaryKey
      ? (game) => ({
          translationKey: summaryKey,
          values: { count: String(game.stageCount) },
        })
      : undefined,
  };
}

type DashboardGameOverrides = Omit<Partial<DashboardGameListItem>, 'gameId' | 'gameTypeId'> & {
  readonly gameId?: GameId;
  readonly gameTypeId?: GameTypeId | null;
};

function createGame(overrides: DashboardGameOverrides): DashboardGameListItem {
  const { gameId, gameTypeId, ...restOverrides } = overrides;

  return {
    gameId: gameId ?? gameIdentifier.parse(1),
    type: GameType.Quiz,
    title: 'Game',
    description: null,
    createdAt: '2026-04-12T10:00:00.000Z',
    gameTypeId: gameTypeId === undefined ? gameTypeIdentifier.parse(9) : gameTypeId,
    stageCount: 1,
    permissions: {
      createParty: {
        allowed: true,
        reason: null,
      },
      launchReadiness: {
        allowed: true,
        reason: null,
      },
    },
    ...restOverrides,
  };
}
