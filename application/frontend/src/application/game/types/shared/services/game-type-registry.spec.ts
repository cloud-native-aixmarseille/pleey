import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { StaticGameTypeCatalogFactory } from '../../../../../app/bootstrap/modules/workspace/container';
import type { GameId } from '../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType, type GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import { GameIdentifierMockFactory } from '../../../../../test-utils/mocks/game-identifier-mock-factory';
import { GameTypeIdentifierMockFactory } from '../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../test-utils/mocks/project-identifier-mock-factory';
import type { GameTypeContributor } from '../contracts/game-type-contributor';
import {
  PlayableContentImportExampleFormat,
  type PlayableContentImportExampleProvider,
} from '../contracts/playable-content-import.gateway';
import { GameTypeRegistry } from './game-type-registry';

const gameIdentifier = new GameIdentifierMockFactory().create();
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const projectIdentifier = new ProjectIdentifierMockFactory().create();
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
      createContributor({
        key: 'prediction',
        summaryKey: 'game.types.prediction.management.promptSummary',
      }),
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
      {
        ...games[1],
        summary: {
          translationKey: 'game.types.prediction.management.promptSummary',
          values: { count: '4' },
        },
      },
    ]);
  });

  it('resolves the management route from the contributed descriptor', () => {
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz', managementRoutePath: '/quizzes' }),
      createContributor({ key: 'prediction' }),
    ]);

    expect(
      registry.resolveManagementRoute({
        type: 'quiz',
        gameTypeId: gameTypeIdentifier.parse(24),
      }),
    ).toBe(`/quizzes/${gameTypeIdentifier.parse(24)}`);
    expect(registry.resolveManagementRoute({ type: 'quiz', gameTypeId: null })).toBeNull();
    expect(registry.resolveManagementRouteByType('quiz', gameTypeIdentifier.parse(31))).toBe(
      `/quizzes/${gameTypeIdentifier.parse(31)}`,
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
    expect(createQuiz).toHaveBeenCalledWith(projectId, {
      title: 'Sprint quiz',
      description: null,
    });
  });

  it('delegates example provider lookup to the contributor', () => {
    const importExampleProvider = createImportExampleProvider();
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz' }),
      createContributor({
        key: 'prediction',
        importExampleProvider,
      }),
    ]);

    expect(registry.getImportExampleProvider('prediction')).toBe(importExampleProvider);
  });

  it('delegates atomic game creation from import to the contributor for the requested type', async () => {
    const createGameFromImport = vi.fn().mockResolvedValue({
      gameTypeId: gameTypeIdentifier.parse(17),
      importedCount: 3,
    }) as GameTypeContributor['createGameFromImport'];
    const registry = new GameTypeRegistry(gameTypeCatalogFactory, [
      createContributor({ key: 'quiz' }),
      createContributor({ key: 'prediction', createGameFromImport }),
    ]);
    const importFile = new File(['[]'], 'prompts.json', { type: 'application/json' });

    await expect(
      registry.createGameFromImport('prediction', projectIdentifier.parse(8), {
        title: 'Sprint prediction',
        description: null,
        file: importFile,
      }),
    ).resolves.toEqual({ gameTypeId: gameTypeIdentifier.parse(17), importedCount: 3 });

    expect(createGameFromImport).toHaveBeenCalledWith(projectIdentifier.parse(8), {
      title: 'Sprint prediction',
      description: null,
      file: importFile,
    });
  });
});

function createContributor({
  key,
  managementRoutePath,
  createGame,
  createGameFromImport,
  importExampleProvider,
  summaryKey,
}: {
  key: GameType;
  managementRoutePath?: string;
  createGame?: GameTypeContributor['createGame'];
  createGameFromImport?: GameTypeContributor['createGameFromImport'];
  importExampleProvider?: PlayableContentImportExampleProvider;
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
    importExampleProvider: importExampleProvider ?? createImportExampleProvider(),
    createGame:
      createGame ??
      vi.fn().mockResolvedValue(gameTypeIdentifier.parse(key === GameType.Quiz ? 41 : 42)),
    createGameFromImport:
      createGameFromImport ??
      vi.fn().mockResolvedValue({
        gameTypeId: gameTypeIdentifier.parse(key === GameType.Quiz ? 41 : 42),
        importedCount: 0,
      }),
    buildGameSummary: (game) => ({
      translationKey:
        summaryKey ??
        (key === GameType.Quiz
          ? 'game.types.quiz.management.questionSummary'
          : 'game.types.prediction.management.promptSummary'),
      values: { count: String(game.stageCount) },
    }),
  };
}

function createImportExampleProvider(): PlayableContentImportExampleProvider {
  return {
    create: vi.fn().mockReturnValue({
      content: '[]',
      fileName: 'example.json',
      mimeType: 'application/json',
    }),
    listFormats: vi.fn().mockReturnValue([PlayableContentImportExampleFormat.JSON]),
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
