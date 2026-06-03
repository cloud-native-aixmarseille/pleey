import { GameIdentifier } from '../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../application/game/types/shared/services/game-type-identifier';
import { GameTypeParser } from '../../application/game/types/shared/services/game-type-parser';
import type { GameId } from '../../domains/game/entities/game';
import {
  CreatePartyDisabledReason,
  type DashboardGameListItem,
  type DashboardGameSummary,
} from '../../domains/game/management/entities/dashboard-game-list-item';
import { GameType, type GameTypeId } from '../../domains/game/types/shared/game-type';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const gameIdentifier = new GameIdentifier();
const gameTypeIdentifier = new GameTypeIdentifier();
const gameTypeParser = new GameTypeParser();

type DashboardGamePermissions = DashboardGameListItem['permissions'];

type DashboardGamePermissionOverrides = {
  readonly createParty?: Partial<DashboardGamePermissions['createParty']>;
  readonly launchReadiness?: Partial<DashboardGamePermissions['launchReadiness']>;
};

interface GameOverrides
  extends Omit<Partial<DashboardGameListItem>, 'gameId' | 'gameTypeId' | 'permissions' | 'type'> {
  readonly gameId?: number | GameId;
  readonly gameTypeId?: number | GameTypeId | null;
  readonly type?: DashboardGameListItem['type'] | string;
  readonly permissions?: DashboardGamePermissionOverrides;
  readonly summary?: DashboardGameSummary | null;
}

export class GameFixtureFactory {
  createDashboardGame(overrides: GameOverrides = {}): DashboardGameListItem {
    const { gameId, gameTypeId, permissions, type, ...restOverrides } = overrides;

    const defaultPermissions: DashboardGamePermissions = {
      createParty: {
        allowed: true,
        reason: null,
      },
      launchReadiness: {
        allowed: true,
        reason: null,
      },
    };

    return {
      gameId:
        gameId === undefined
          ? gameIdentifier.parse(coerceUuidV7TestValue(18))
          : typeof gameId === 'number'
            ? gameIdentifier.parse(coerceUuidV7TestValue(gameId))
            : gameId,
      type:
        type === undefined
          ? GameType.Quiz
          : (gameTypeParser.parse(type) as DashboardGameListItem['type']),
      title: 'Roadmap quiz',
      description: 'Planning workshop',
      createdAt: '2026-03-19T08:30:00.000Z',
      gameTypeId:
        gameTypeId === undefined
          ? gameTypeIdentifier.parse(coerceUuidV7TestValue(1))
          : gameTypeId === null
            ? null
            : typeof gameTypeId === 'number'
              ? gameTypeIdentifier.parse(coerceUuidV7TestValue(gameTypeId))
              : gameTypeId,
      stageCount: 14,
      permissions: {
        createParty: {
          ...defaultPermissions.createParty,
          ...permissions?.createParty,
        },
        launchReadiness: {
          ...defaultPermissions.launchReadiness,
          ...permissions?.launchReadiness,
        },
      },
      ...restOverrides,
    };
  }

  createBlockedDashboardGame(overrides: GameOverrides = {}): DashboardGameListItem {
    return this.createDashboardGame({
      permissions: {
        createParty: {
          allowed: false,
          reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
        },
      },
      ...overrides,
    });
  }
}
