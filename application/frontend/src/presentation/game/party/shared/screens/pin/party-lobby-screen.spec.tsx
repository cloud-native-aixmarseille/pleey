import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PartyLobbyGateway } from '../../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyHostControlPort } from '../../../../../../domains/game/party/host/ports/party-host-control.port';
import { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { type PartyManagementPort } from '../../../../../../domains/game/party/host/ports/party-management.port';
import type { PartyGuestSessionPort } from '../../../../../../domains/game/party/player/ports/party-guest-session.port';
import type {
  PartyJoinReceipt,
  PartyPlayerPort,
} from '../../../../../../domains/game/party/player/ports/party-player.port';
import { PartyJoinReceiptStatus } from '../../../../../../domains/game/party/player/ports/party-player.port';
import type { Party, PartyId } from '../../../../../../domains/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyRole } from '../../../../../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../../../../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GuestId } from '../../../../../../domains/identity/entities/guest';
import type { User, UserId } from '../../../../../../domains/identity/entities/user';
import { AuthFixtureFactory } from '../../../../../../test-utils/fixtures/auth-fixture-factory';
import { PartyFixtureFactory } from '../../../../../../test-utils/fixtures/party-fixture-factory';
import { GameIdentifierMockFactory } from '../../../../../../test-utils/mocks/game-identifier-mock-factory';
import { GuestIdentifierMockFactory } from '../../../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyActionIdentifierMockFactory } from '../../../../../../test-utils/mocks/party-action-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { UserIdentifierMockFactory } from '../../../../../../test-utils/mocks/user-identifier-mock-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { PartyLobbyScreen } from './party-lobby-screen';
import { PartyLobbyRouteKind, PartyScreenSection } from './use-party-lobby-screen-state';

const runtimeGameType = Object.values(GameType)[0] as GameType;

const guestIdentifier = new GuestIdentifierMockFactory().create();
const userIdentifier = new UserIdentifierMockFactory().create();
const partyIdentifier = new PartyIdentifierMockFactory().create();
const partyPinIdentifier = new PartyPinIdentifierMockFactory().create();
const stageIdentifier = new StageIdentifierMockFactory().create();
const partyActionIdentifier = new PartyActionIdentifierMockFactory().create();
const toStageId = (value: number) => stageIdentifier.parse(value);
const toActionId = (value: number) => partyActionIdentifier.parse(value);
const gameIdentifier = new GameIdentifierMockFactory().create();
const authFixtureFactory = new AuthFixtureFactory();
const partyFixtureFactory = new PartyFixtureFactory();

type StagePartyRuntimeContext = Extract<
  NonNullable<PartyObservation['context']>,
  { lifecycle: { phase: 'stage' } }
>;
type ResultPartyRuntimeContext = Extract<
  NonNullable<PartyObservation['context']>,
  { lifecycle: { phase: 'result' } }
>;
type StagePartyRuntimeContextOverrides = {
  readonly lifecycle?: Partial<StagePartyRuntimeContext['lifecycle']>;
  readonly stage?: {
    readonly actionSubmission?: Partial<StagePartyRuntimeContext['stage']['actionSubmission']>;
    readonly current?: Partial<StagePartyRuntimeContext['stage']['current']>;
  };
};
type ResultPartyRuntimeContextOverrides = {
  readonly lifecycle?: Partial<ResultPartyRuntimeContext['lifecycle']>;
  readonly result?: {
    readonly current?: Partial<ResultPartyRuntimeContext['result']['current']>;
    readonly currentPlayer?: ResultPartyRuntimeContext['result']['currentPlayer'];
  };
};

type LegacyPartyIdentity =
  | {
      readonly kind: PartyPlayerIdentityKind.User;
      readonly userId: UserId;
    }
  | {
      readonly kind: PartyPlayerIdentityKind.Guest;
      readonly guestId: GuestId;
    };

interface LegacyObservedPartyEntry {
  readonly avatarUri: string | null;
  readonly identity: LegacyPartyIdentity;
  readonly joinedAt: string;
  readonly role: PartyRole.HOST | PartyRole.PLAYER;
  readonly totalScore: number;
  readonly username: string;
}

type LegacyObservedUserPartyEntry = LegacyObservedPartyEntry & {
  readonly identity: {
    readonly kind: PartyPlayerIdentityKind.User;
    readonly userId: UserId;
  };
};

function createRejectedJoinReceipt(
  errorMessage = 'game.party.errors.joinFailed',
): PartyJoinReceipt {
  return {
    errorMessage,
    status: PartyJoinReceiptStatus.REJECTED,
  };
}

function createUserEntry(
  userId: UserId,
  username: string,
  role: PartyRole.HOST | PartyRole.PLAYER,
  options: {
    avatarUri: string | null;
    totalScore: number;
    joinedAt: string;
  },
): LegacyObservedPartyEntry {
  return {
    ...partyFixtureFactory.createPlayer({
      avatarUri: options.avatarUri,
      identity: { kind: PartyPlayerIdentityKind.User, userId },
      joinedAt: options.joinedAt,
      totalScore: options.totalScore,
      username,
    }),
    joinedAt: options.joinedAt,
    role,
  };
}

function createGuestEntry(
  guestId: GuestId,
  username: string,
  options: {
    avatarUri: string | null;
    totalScore: number;
    joinedAt: string;
  },
): LegacyObservedPartyEntry {
  return {
    ...partyFixtureFactory.createPlayer({
      avatarUri: options.avatarUri,
      identity: { kind: PartyPlayerIdentityKind.Guest, guestId },
      joinedAt: options.joinedAt,
      totalScore: options.totalScore,
      username,
    }),
    joinedAt: options.joinedAt,
    role: PartyRole.PLAYER,
  };
}

const mocks = vi.hoisted(() => {
  const observationState = {
    currentErrorMessage: null as string | null,
    currentErrorPartyId: null as PartyId | null,
    currentParty: null as PartyObservation | null,
    currentRuntimeNotice: null as {
      kind: 'restartStage' | 'rewindParty' | 'rewindStage';
      partyId: PartyId;
    } | null,
    getErrorByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null &&
        partyId !== undefined &&
        observationState.currentErrorPartyId === partyId
        ? observationState.currentErrorMessage
        : null;
    },
    getPartyByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null &&
        partyId !== undefined &&
        observationState.currentParty?.partyId === partyId
        ? observationState.currentParty
        : null;
    },
    getRuntimeNoticeByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null &&
        partyId !== undefined &&
        observationState.currentRuntimeNotice?.partyId === partyId
        ? observationState.currentRuntimeNotice
        : null;
    },
    normalizePartyId: (partyId?: string | null) => {
      if (typeof partyId !== 'string' || partyId.trim().length === 0) {
        return null;
      }

      const parsedPartyId = Number(partyId);

      return Number.isInteger(parsedPartyId) && parsedPartyId > 0
        ? partyIdentifier.parse(parsedPartyId)
        : null;
    },
    normalizePin: (pin?: string | null) => {
      const normalizedPin = pin?.trim().toUpperCase() ?? '';

      return normalizedPin.length > 0 ? partyPinIdentifier.parse(normalizedPin) : null;
    },
    observePartyById: vi.fn(() => vi.fn()),
  };

  return {
    authState: {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null as User | null,
    },
    hostPartyRuntimeControlsResolver: {
      resolveControls: vi.fn((party) => {
        const lifecycle = party.context?.lifecycle ?? null;
        const lifecyclePhase = lifecycle?.phase ?? (party.status === 'ENDED' ? 'ended' : 'lobby');
        const currentStageNumber =
          lifecycle?.stagePosition === null || lifecycle?.stagePosition === undefined
            ? null
            : lifecycle.stagePosition + 1;
        const totalStages = lifecycle?.totalStages ?? null;
        const canControlActiveRuntime =
          (party.status === 'ACTIVE' || party.status === 'PAUSED') &&
          (lifecyclePhase === 'stage' || lifecyclePhase === 'result');

        return {
          canAdvanceStage: party.status === 'ACTIVE' && lifecyclePhase === 'result',
          canEndParty: party.status !== 'ENDED',
          canPauseParty: party.status === 'ACTIVE' && canControlActiveRuntime,
          canRestartStage: canControlActiveRuntime && currentStageNumber !== null,
          canResumeParty: party.status === 'PAUSED' && canControlActiveRuntime,
          canRevealStageResult: party.status === 'ACTIVE' && lifecyclePhase === 'stage',
          canRewindParty: canControlActiveRuntime,
          canRewindStage:
            canControlActiveRuntime && currentStageNumber !== null && currentStageNumber > 1,
          canStartParty: party.status === 'WAITING' && party.players.length > 0,
          currentStageNumber,
          hasNextStage:
            lifecycle?.stagePosition !== null &&
            lifecycle?.stagePosition !== undefined &&
            lifecycle.totalStages > lifecycle.stagePosition + 1,
          isPaused: party.status === 'PAUSED',
          lifecyclePhase,
          totalStages,
        };
      }),
    },
    partyManagementState: {
      parties: [] as readonly Party[],
    },
    partyManagementPort: {
      createParty: vi.fn(),
      listParties: vi.fn(async () => mocks.partyManagementState.parties),
    } as PartyManagementPort,
    partyHostControlPort: {
      advanceStage: vi.fn(async () => undefined),
      endParty: vi.fn(async () => undefined),
      pauseParty: vi.fn(async () => undefined),
      restartStage: vi.fn(async () => undefined),
      resumeParty: vi.fn(async () => undefined),
      revealStageResult: vi.fn(async () => undefined),
      rewindParty: vi.fn(async () => undefined),
      rewindStage: vi.fn(async () => undefined),
      startParty: vi.fn(async () => undefined),
    } as PartyHostControlPort,
    partyPlayerPort: {
      joinParty: vi.fn(async () => createRejectedJoinReceipt()),
      leaveParty: vi.fn(async () => true),
      rejoinParty: vi.fn(async () => createRejectedJoinReceipt()),
      submitAction: vi.fn(async () => undefined),
    } as PartyPlayerPort,
    partyGuestSessionPort: {
      clearGuestId: vi.fn(),
      getGuestId: vi.fn(() => null),
      setGuestId: vi.fn(),
    } as PartyGuestSessionPort,
    partyLobbyFacade: {
      clearGuestId: (pin) => mocks.partyGuestSessionPort.clearGuestId(pin),
      executeHostRuntimeCommand: async (command, partyId) => {
        const hostCommand = { partyId };

        switch (command) {
          case HostPartyRuntimeCommand.AdvanceStage:
            await mocks.partyHostControlPort.advanceStage(hostCommand);
            return;
          case HostPartyRuntimeCommand.EndParty:
            await mocks.partyHostControlPort.endParty(hostCommand);
            return;
          case HostPartyRuntimeCommand.PauseParty:
            await mocks.partyHostControlPort.pauseParty(hostCommand);
            return;
          case HostPartyRuntimeCommand.RestartStage:
            await mocks.partyHostControlPort.restartStage(hostCommand);
            return;
          case HostPartyRuntimeCommand.ResumeParty:
            await mocks.partyHostControlPort.resumeParty(hostCommand);
            return;
          case HostPartyRuntimeCommand.RevealStageResult:
            await mocks.partyHostControlPort.revealStageResult(hostCommand);
            return;
          case HostPartyRuntimeCommand.RewindParty:
            await mocks.partyHostControlPort.rewindParty(hostCommand);
            return;
          case HostPartyRuntimeCommand.RewindStage:
            await mocks.partyHostControlPort.rewindStage(hostCommand);
            return;
          case HostPartyRuntimeCommand.StartParty:
            await mocks.partyHostControlPort.startParty(hostCommand);
            return;
        }
      },
      getGuestId: (pin) => mocks.partyGuestSessionPort.getGuestId(pin),
      joinParty: (command) => mocks.partyPlayerPort.joinParty(command),
      leaveParty: () => mocks.partyPlayerPort.leaveParty(),
      listParties: () => mocks.partyManagementPort.listParties(),
      rejoinParty: (command) => mocks.partyPlayerPort.rejoinParty(command),
      setGuestId: (pin, guestId) => mocks.partyGuestSessionPort.setGuestId(pin, guestId),
      submitAction: (command) => mocks.partyPlayerPort.submitAction(command),
    } as PartyLobbyGateway,
    partyObservationPort: {
      observeParty: vi.fn(() => vi.fn()),
    },
    observationState,
    navigate: vi.fn(),
    params: {
      pin: 'ab12cd',
    } as Record<string, string | undefined>,
    pathname: '/',
  };
});

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../../../test-utils/render-with-providers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../../../../test-utils/render-with-providers')>();
  const { render } = await import('@testing-library/react');
  const { MantineProvider } = await import('@mantine/core');
  const { MemoryRouter } = await import('react-router-dom');

  return {
    ...actual,
    renderWithProviders: (
      ui: React.ReactElement,
      { initialPath = '/', ...options }: { initialPath?: string } = {},
    ) => {
      return render(ui, {
        wrapper: ({ children }) => (
          <MantineProvider>
            <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
          </MantineProvider>
        ),
        ...options,
      });
    },
  };
});

vi.mock('../../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');
  const routingMockFactory = new RoutingMockFactory();
  const actual = await importOriginal<typeof import('../../../../../shared/routing/router')>();

  return {
    ...actual,
    ...routingMockFactory.createModule({
      navigate: mocks.navigate,
      params: new Proxy({} as Record<string, string | undefined>, {
        get: (_, property) => mocks.params[property as string],
      }),
    }),
    usePresentationPathname: () => mocks.pathname,
    PresentationRedirect: ({ to }: { to: string }) => (
      <div data-testid="party-lobby-redirect">{to}</div>
    ),
  };
});

vi.mock('../../../../../identity/contexts/auth-context', async (importOriginal) => {
  const { AuthContextMockFactory } = await import('src/test-utils/mocks/auth-context-mock-factory');
  const authContextMockFactory = new AuthContextMockFactory();

  return {
    ...(await importOriginal<typeof import('../../../../../identity/contexts/auth-context')>()),
    useAuth: () => authContextMockFactory.createValue(mocks.authState),
  };
});

vi.mock('../../contexts/party-dependencies-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/party-dependencies-context')>();

  return {
    ...actual,
    usePartyDependencies: () => ({
      hostPartyRuntimeControlsResolver: mocks.hostPartyRuntimeControlsResolver,
      partyIdentifier,
      partyLobbyFacade: mocks.partyLobbyFacade,
      partyGuestSessionPort: mocks.partyGuestSessionPort,
      partyHostControlPort: mocks.partyHostControlPort,
      partyManagementPort: mocks.partyManagementPort,
      partyPlayerPort: mocks.partyPlayerPort,
      partyObservationPort: mocks.partyObservationPort,
      partyPinIdentifier,
      stageIdentifier,
    }),
  };
});

vi.mock('../../contexts/party-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/party-context')>();

  return {
    ...actual,
    useParty: () => mocks.observationState,
  };
});

vi.mock('../../contexts/party-game-type-runtime-registry-context', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../contexts/party-game-type-runtime-registry-context')
    >();

  return {
    ...actual,
    usePartyGameTypeRuntimeRegistry: () => ({
      resolve: () => ({
        renderHostResultPanel: ({ party }: { party: PartyObservation }) => {
          const currentResult = party.context?.result?.current;
          const actions = currentResult?.actions ?? [];
          const correctCount = actions.filter((action) => action.isCorrect).length;
          const voteCount = actions.reduce((total, action) => total + action.actionCount, 0);

          return (
            <div data-testid="party-runtime-host-result-panel">
              <span>{currentResult?.text}</span>
              <span>{`runtime-result.correct-count:${correctCount}`}</span>
              <span>{`runtime-result.vote-count:${voteCount}`}</span>
            </div>
          );
        },
        renderHostStagePanel: ({ party }: { party: PartyObservation }) => {
          const currentStage = party.context?.stage?.current;
          const actionSubmission = party.context?.stage?.actionSubmission;

          return (
            <div data-testid="party-runtime-host-stage-panel">
              <span>{currentStage?.text}</span>
              <span>{`runtime-stage.submission-progress:${actionSubmission?.submittedPlayerCount ?? 0}/${actionSubmission?.totalEligiblePlayerCount ?? 0}`}</span>
            </div>
          );
        },
        renderPlayerResultSurface: ({ party }: { party: PartyObservation }) => {
          const currentPlayerResult = party.context?.result?.currentPlayer;

          return (
            <div data-testid="party-runtime-player-result-surface">
              <span>
                {currentPlayerResult?.isCorrect
                  ? 'runtime-result.current-player.correct'
                  : 'runtime-result.current-player.incorrect'}
              </span>
              <span>{`runtime-result.current-player.points:${currentPlayerResult?.earnedPoints ?? 0}`}</span>
            </div>
          );
        },
        renderPlayerStageSurface: ({
          party,
          onSubmitAction,
          pendingActionId,
          playerActionErrorMessage,
        }: {
          party: PartyObservation;
          onSubmitAction: (actionId: PartyActionId) => void;
          pendingActionId: PartyActionId | null;
          playerActionErrorMessage: string | null;
        }) => {
          const currentStage = party.context?.stage?.current;
          const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer;

          return (
            <div data-testid="party-runtime-player-stage-surface">
              {currentStage?.actions.map((action) => (
                <button key={action.id} type="button" onClick={() => onSubmitAction(action.id)}>
                  {action.text}
                </button>
              ))}
              {playerActionErrorMessage ? <span>{playerActionErrorMessage}</span> : null}
              {currentPlayerAction ? <span>runtime-stage.current-player.locked</span> : null}
              {pendingActionId !== null && currentPlayerAction === null ? (
                <span>game.party.player.route.actionSubmitting</span>
              ) : null}
            </div>
          );
        },
      }),
    }),
  };
});

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import(
    'src/test-utils/mocks/react-qr-code-mock-factory'
  );

  return new ReactQrCodeMockFactory().createModule();
});

function createPartyObservation(
  overrides: Partial<PartyObservation> & {
    readonly entries?: readonly LegacyObservedPartyEntry[];
    readonly liveObserverIdentities?: readonly LegacyPartyIdentity[];
  } = {},
): PartyObservation {
  const {
    entries: legacyEntries,
    liveObserverIdentities: legacyLiveObserverIdentities,
    ...rest
  } = overrides as Partial<PartyObservation> & {
    readonly entries?: readonly LegacyObservedPartyEntry[];
    readonly liveObserverIdentities?: readonly LegacyPartyIdentity[];
  };
  const playerIdentity: LegacyPartyIdentity = {
    kind: PartyPlayerIdentityKind.User,
    userId: userIdentifier.parse(11),
  };
  const resolvedEntries = legacyEntries ?? [
    createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
      avatarUri: '/avatars/host.png',
      totalScore: 0,
      joinedAt: '2026-04-21T08:00:00.000Z',
    }),
    createUserEntry(userIdentifier.parse(11), 'Neo', PartyRole.PLAYER, {
      avatarUri: '/avatars/neo.png',
      totalScore: 4,
      joinedAt: '2026-04-21T08:02:00.000Z',
    }),
  ];
  const defaultHostEntry = createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
    avatarUri: '/avatars/host.png',
    totalScore: 0,
    joinedAt: '2026-04-21T08:00:00.000Z',
  }) as LegacyObservedUserPartyEntry;
  const hostEntry =
    resolvedEntries.find(
      (entry): entry is LegacyObservedUserPartyEntry =>
        entry.role === PartyRole.HOST && entry.identity.kind === PartyPlayerIdentityKind.User,
    ) ?? defaultHostEntry;
  const livePlayerIdentities = legacyLiveObserverIdentities
    ?.filter(
      (identity) =>
        identity.kind !== PartyPlayerIdentityKind.User ||
        identity.userId !== hostEntry.identity.userId,
    )
    .map((identity) => toPlayerKey(identity)) ?? [toPlayerKey(playerIdentity)];
  const players = resolvedEntries
    .filter((entry) => entry.role === PartyRole.PLAYER)
    .map((entry, index) => toObservationPlayer(entry, livePlayerIdentities, index === 0));

  return partyFixtureFactory.createPartyObservation({
    context: null,
    gameType: runtimeGameType,
    host: partyFixtureFactory.createHost({
      avatarUri: hostEntry.avatarUri,
      username: hostEntry.username,
    }),
    isObserverHost:
      mocks.authState.user !== null && mocks.authState.user.id === hostEntry.identity.userId,
    partyId: 9,
    pin: 'AB12CD',
    players,
    status: PartyStatus.WAITING,
    ...rest,
  });
}

function toObservationPlayer(
  entry: LegacyObservedPartyEntry,
  livePlayerKeys: readonly string[],
  isCurrentPlayer: boolean,
): PartyObservationPlayer {
  return partyFixtureFactory.createObservationPlayer({
    avatarUri: entry.avatarUri,
    identity: entry.identity,
    isCurrentPlayer,
    isLive: livePlayerKeys.includes(toPlayerKey(entry.identity)),
    totalScore: entry.totalScore,
    username: entry.username,
  });
}

function toPlayerKey(identity: LegacyPartyIdentity): string {
  return identity.kind === PartyPlayerIdentityKind.User
    ? `user:${identity.userId}`
    : `guest:${identity.guestId}`;
}

function createManagedParty(overrides: Partial<Party> = {}): Party {
  return partyFixtureFactory.createParty({
    createdAt: '2026-04-21T08:00:00.000Z',
    gameId: Number(gameIdentifier.parse(17)),
    partyId: 9,
    pin: 'AB12CD',
    role: PartyRole.HOST,
    status: PartyStatus.WAITING,
    ...overrides,
  });
}

function createActiveStageContext(
  overrides: StagePartyRuntimeContextOverrides = {},
): StagePartyRuntimeContext {
  const baseContext: StagePartyRuntimeContext = {
    lifecycle: {
      phase: 'stage' as const,
      stageEndsAtEpochMs: null,
      stageId: toStageId(1),
      stagePosition: 0,
      stageRemainingDurationMs: null,
      stageTimeLimitSeconds: null,
      totalStages: 4,
    },
    stage: {
      actionSubmission: {
        currentPlayer: null,
        submittedPlayerCount: 1,
        totalEligiblePlayerCount: 2,
      },
      current: {
        actions: [
          { id: toActionId(1), text: 'Option A' },
          { id: toActionId(2), text: 'Option B' },
        ],
        text: 'Which option wins?',
      },
    },
  };

  return {
    lifecycle: {
      ...baseContext.lifecycle,
      ...overrides.lifecycle,
    },
    stage: {
      actionSubmission: {
        ...baseContext.stage.actionSubmission,
        ...overrides.stage?.actionSubmission,
      },
      current: {
        ...baseContext.stage.current,
        ...overrides.stage?.current,
      },
    },
  };
}

function createRuntimeResultContext(
  overrides: ResultPartyRuntimeContextOverrides = {},
): ResultPartyRuntimeContext {
  const baseContext: ResultPartyRuntimeContext = {
    lifecycle: {
      phase: 'result' as const,
      stageEndsAtEpochMs: null,
      stageId: toStageId(1),
      stagePosition: 0,
      stageRemainingDurationMs: null,
      stageTimeLimitSeconds: null,
      totalStages: 4,
    },
    result: {
      current: {
        actions: [
          {
            actionCount: 1,
            actionPercent: 33,
            earnedPoints: 0,
            id: toActionId(1),
            isCorrect: false,
            text: 'Option A',
          },
          {
            actionCount: 2,
            actionPercent: 67,
            earnedPoints: 200,
            id: toActionId(2),
            isCorrect: true,
            text: 'Option B',
          },
        ],
        text: 'Which option wins?',
      },
      currentPlayer: {
        earnedPoints: 200,
        isCorrect: true,
        selectedActionId: toActionId(2),
      },
    },
  };

  return {
    lifecycle: {
      ...baseContext.lifecycle,
      ...overrides.lifecycle,
    },
    result: {
      current: {
        ...baseContext.result.current,
        ...overrides.result?.current,
      },
      currentPlayer:
        overrides.result?.currentPlayer === undefined
          ? baseContext.result.currentPlayer
          : overrides.result.currentPlayer,
    },
  };
}

function renderScreen() {
  return renderWithProviders(
    <PartyLobbyScreen
      normalizePin={(pin) =>
        pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
      }
      normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
      resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
    />,
  );
}

describe('PartyLobbyScreen', () => {
  afterEach(() => {
    vi.useRealTimers();
    mocks.navigate.mockReset();
    mocks.pathname = '/';
  });

  it('renders the host lobby with the share panel, PIN tiles and QR code', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.partyGuestSessionPort.getGuestId = vi.fn(() => null);
    mocks.observationState.currentParty = createPartyObservation();
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await waitFor(() => {
      expect(mocks.observationState.observePartyById).toHaveBeenCalledWith(
        partyIdentifier.parse(9),
      );
    });

    expect(await screen.findByText('game.party.host.route.shareHeading')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.scanToJoin')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.hostingBadge')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.playerCount (count=1)')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toHaveTextContent('https://pleey.localhost/join/AB12CD');
    expect(screen.queryByAltText('Host avatar')).not.toBeInTheDocument();
    expect(
      screen.getByAltText('game.party.route.playerAvatarAlt (username=Neo)'),
    ).toBeInTheDocument();

    const pinDisplay = screen.getByRole('img', {
      name: /game\.party\.route\.pinAriaLabel.*pin=AB12CD/,
    });
    expect(pinDisplay).toBeInTheDocument();
    expect(pinDisplay.children).toHaveLength('AB12CD'.length);
    expect(pinDisplay.textContent).toBe('AB12CD');

    mocks.params = { pin: 'ab12cd' };
  });

  it('dispatches host runtime commands from the host lobby', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.WAITING,
      context: null,
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.startPartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.startParty).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });
  });

  it('keeps the start CTA disabled when the host is alone in the lobby', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.partyHostControlPort.startParty = vi.fn(async () => undefined);
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.WAITING,
      context: null,
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    const startButton = await screen.findByRole('button', {
      name: 'game.party.host.route.startPartyCta',
    });

    expect(startButton).toBeDisabled();
    fireEvent.click(startButton);
    expect(mocks.partyHostControlPort.startParty).not.toHaveBeenCalled();
  });

  it('refreshes host command availability after the start-party redirect without a browser refresh', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.partyHostControlPort.startParty = vi.fn(() => new Promise<undefined>(() => undefined));
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.WAITING,
      context: null,
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    const view = renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.startPartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.startParty).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });

    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext(),
    });

    view.rerender(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await screen.findByTestId('host-runtime-surface');

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.runtimeMenuTrigger' }),
    );

    await waitFor(async () => {
      expect(
        await screen.findByRole('menuitem', { name: 'game.party.host.route.revealStageResultCta' }),
      ).not.toHaveAttribute('data-disabled');
    });
  });

  it('renders the player roster without the share panel and highlights the current user', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(11) },
        { kind: PartyPlayerIdentityKind.Guest, guestId: guestIdentifier.parse('guest-1') },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
        createUserEntry(userIdentifier.parse(11), 'Neo', PartyRole.PLAYER, {
          avatarUri: '/avatars/neo.png',
          totalScore: 8,
          joinedAt: '2026-04-21T08:01:00.000Z',
        }),
        createGuestEntry(guestIdentifier.parse('guest-1'), 'Guest One', {
          avatarUri: '/avatars/guest.png',
          totalScore: 1,
          joinedAt: '2026-04-21T08:02:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await screen.findByText('Neo');

    expect(screen.queryByText('game.party.host.route.shareHeading')).not.toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
    expect(screen.getByText('Guest One')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.playerCount (count=2)')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.youBadge')).toBeInTheDocument();
    expect(screen.getByText('game.party.player.route.waitingForHost')).toBeInTheDocument();
    expect(
      screen.getByText('game.party.player.route.currentHost (username=Host)'),
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Host avatar')).not.toBeInTheDocument();
  });

  it('leaves the party from the player lobby route', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation();
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.player.route.leavePartyCta' }),
    );

    expect(mocks.partyPlayerPort.leaveParty).not.toHaveBeenCalled();

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.player.route.confirmLeavePartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyPlayerPort.leaveParty).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/');
  });

  it('submits a player action from the live stage surface and shows pending feedback', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.partyPlayerPort.submitAction = vi.fn(() => new Promise<void>(() => undefined));
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Option B' }));

    await waitFor(() => {
      expect(mocks.partyPlayerPort.submitAction).toHaveBeenCalledWith({
        actionId: 2,
        partyId: partyIdentifier.parse(9),
      });
    });

    expect(screen.getByText('game.party.player.route.actionSubmitting')).toBeInTheDocument();
  });

  it('shows the locked acknowledgement once the stream confirms the submitted action', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext({
        stage: {
          actionSubmission: {
            currentPlayer: {
              selectedActionId: toActionId(2),
              status: 'acknowledged',
            },
            submittedPlayerCount: 2,
            totalEligiblePlayerCount: 2,
          },
          current: {
            actions: [
              { id: toActionId(1), text: 'Option A' },
              { id: toActionId(2), text: 'Option B' },
            ],
            text: 'Which option wins?',
          },
        },
      }),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-runtime-player-stage-surface')).toBeInTheDocument();
    expect(screen.getByText('runtime-stage.current-player.locked')).toBeInTheDocument();
  });

  it('redirects the party lobby route to the dedicated stage screen while a stage is active', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        resolvePartyStageRoute={(partyId, stageId) => `/party/${partyId}/stage/${stageId}`}
      />,
    );

    expect(await screen.findByText('game.party.host.route.shareHeading')).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/party/9/stage/1');
    });
  });

  it('redirects the host to the dashboard after confirming end party', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.partyHostControlPort.endParty = vi.fn(async () => undefined);
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
        createUserEntry(userIdentifier.parse(8), 'Player One', PartyRole.PLAYER, {
          avatarUri: '/avatars/player.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:05:00.000Z',
        }),
      ],
    });

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.runtimeMenuTrigger' }),
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.endPartyCta' }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.confirmEndPartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.endParty).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent(
      '/workspace/dashboard',
    );
  });

  it('confirms before restarting the current stage', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.partyHostControlPort.restartStage = vi.fn(async () => undefined);
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.currentParty = createPartyObservation({
      context: createActiveStageContext(),
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      status: PartyStatus.ACTIVE,
    });

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        screenSection={PartyScreenSection.STAGE}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.runtimeMenuTrigger' }),
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.restartStageCta' }),
    );

    expect(mocks.partyHostControlPort.restartStage).not.toHaveBeenCalled();

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.confirmRestartStageCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.restartStage).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });
  });

  it('confirms before rewinding to the previous stage', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '2' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.partyHostControlPort.rewindStage = vi.fn(async () => undefined);
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.currentParty = createPartyObservation({
      context: createActiveStageContext({
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: null,
          stageId: toStageId(2),
          stagePosition: 1,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 1,
            totalEligiblePlayerCount: 2,
          },
          current: {
            actions: [
              { id: toActionId(1), text: 'Option A' },
              { id: toActionId(2), text: 'Option B' },
            ],
            text: 'Which option wins?',
          },
        },
      }),
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      status: PartyStatus.ACTIVE,
    });

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        screenSection={PartyScreenSection.STAGE}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.runtimeMenuTrigger' }),
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.rewindStageCta' }),
    );

    expect(mocks.partyHostControlPort.rewindStage).not.toHaveBeenCalled();

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.confirmRewindStageCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.rewindStage).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });
  });

  it('confirms before sending the party back to the lobby', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.partyHostControlPort.rewindParty = vi.fn(async () => undefined);
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.currentParty = createPartyObservation({
      context: createActiveStageContext(),
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      status: PartyStatus.ACTIVE,
    });

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        screenSection={PartyScreenSection.STAGE}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.runtimeMenuTrigger' }),
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.rewindPartyCta' }),
    );

    expect(mocks.partyHostControlPort.rewindParty).not.toHaveBeenCalled();

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.confirmRewindPartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.rewindParty).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });
  });

  it('redirects ended parties to the dedicated final leaderboard screen', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [
      createManagedParty({ role: PartyRole.PLAYER, status: PartyStatus.ENDED }),
    ];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ENDED,
      context: {
        ...createRuntimeResultContext(),
        lifecycle: {
          phase: 'ended',
          stageEndsAtEpochMs: null,
          stageId: toStageId(1),
          stagePosition: 0,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.RESULT}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        resolvePartyLeaderboardRoute={(partyId) => `/party/${partyId}/final`}
      />,
    );

    expect(await screen.findByTestId('party-runtime-player-result-surface')).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/party/9/final');
    });
  });

  it('renders the generic host stage panel on the dedicated stage screen', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('host-runtime-surface')).toBeInTheDocument();
    expect(screen.getByTestId('party-runtime-host-stage-panel')).toBeInTheDocument();
    expect(screen.getByText('Which option wins?')).toBeInTheDocument();
    expect(screen.getByText('runtime-stage.submission-progress:1/2')).toBeInTheDocument();
  });

  it('automatically reveals the stage result once all players have submitted', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext({
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 2,
            totalEligiblePlayerCount: 2,
          },
          current: {
            actions: [
              { id: toActionId(1), text: 'Option A' },
              { id: toActionId(2), text: 'Option B' },
            ],
            text: 'Which option wins?',
          },
        },
      }),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.revealStageResult).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });
  });

  it('automatically reveals the stage result once the timer has elapsed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const activeStageContext = createActiveStageContext();
    const currentStage = activeStageContext.stage.current!;

    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext({
        lifecycle: {
          ...activeStageContext.lifecycle,
          stageEndsAtEpochMs: 4_000,
          stageTimeLimitSeconds: 3,
        },
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 1,
            totalEligiblePlayerCount: 2,
          },
          current: {
            actions: currentStage.actions,
            text: currentStage.text,
          },
        },
      }),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });

    expect(mocks.partyHostControlPort.revealStageResult).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(9),
    });
  });

  it('renders the generic host result panel on the dedicated result screen', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.pathname = '/party/9/stage/1/result';
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createRuntimeResultContext({
        result: {
          current: createRuntimeResultContext().result?.current ?? null,
          currentPlayer: null,
        },
      }),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('host-runtime-surface')).toBeInTheDocument();
    expect(screen.getByTestId('party-runtime-host-result-panel')).toBeInTheDocument();
    expect(screen.getByText('runtime-result.correct-count:1')).toBeInTheDocument();
    expect(screen.getByText('runtime-result.vote-count:3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'game.party.host.route.advanceStageCta' }),
    ).toBeEnabled();
  });

  it('renders the host result panel when the host journey route provides stageId only via pathname', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.pathname = '/party/9/stage/1/result';
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createRuntimeResultContext({
        result: {
          current: createRuntimeResultContext().result?.current ?? null,
          currentPlayer: null,
        },
      }),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('host-runtime-surface')).toBeInTheDocument();
    expect(screen.getByTestId('party-runtime-host-result-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('party-lobby-redirect')).not.toBeInTheDocument();
  });

  it('redirects the host to the final leaderboard after finishing the last result screen', async () => {
    const finalResultContext = createRuntimeResultContext({
      lifecycle: {
        phase: 'result',
        stageEndsAtEpochMs: null,
        stageId: toStageId(4),
        stagePosition: 3,
        stageRemainingDurationMs: null,
        stageTimeLimitSeconds: null,
        totalStages: 4,
      },
      result: {
        current: {
          ...(createRuntimeResultContext().result?.current ?? {
            actions: [],
            text: 'Which option wins?',
          }),
        },
        currentPlayer: null,
      },
    });

    mocks.params = { partyId: '9', pin: undefined, stageId: '4' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ status: PartyStatus.ACTIVE })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: finalResultContext,
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());
    mocks.partyHostControlPort.advanceStage = vi.fn(async () => {
      mocks.observationState.currentParty = createPartyObservation({
        status: PartyStatus.ENDED,
        context: {
          ...finalResultContext,
          lifecycle: {
            phase: 'ended',
            stageEndsAtEpochMs: null,
            stageId: toStageId(4),
            stagePosition: 3,
            stageRemainingDurationMs: null,
            stageTimeLimitSeconds: null,
            totalStages: 4,
          },
        },
      });
    });

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.RESULT}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.host.route.showFinalLeaderboardCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyHostControlPort.advanceStage).toHaveBeenCalledWith({
        partyId: partyIdentifier.parse(9),
      });
    });

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/party/9/final');
    });
  });

  it('renders the dedicated final leaderboard screen for ended player parties', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [
      createManagedParty({ role: PartyRole.PLAYER, status: PartyStatus.ENDED }),
    ];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ENDED,
      context: {
        ...createRuntimeResultContext(),
        lifecycle: {
          phase: 'ended',
          stageEndsAtEpochMs: null,
          stageId: toStageId(1),
          stagePosition: 0,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          joinedAt: '2026-04-21T08:00:00.000Z',
          totalScore: 0,
        }),
        createUserEntry(userIdentifier.parse(11), 'Neo', PartyRole.PLAYER, {
          avatarUri: '/avatars/neo.png',
          joinedAt: '2026-04-21T08:01:00.000Z',
          totalScore: 800,
        }),
        createGuestEntry(guestIdentifier.parse('guest-1'), 'Guest One', {
          avatarUri: '/avatars/guest.png',
          joinedAt: '2026-04-21T08:02:00.000Z',
          totalScore: 1200,
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.LEADERBOARD}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('player-final-surface')).toBeInTheDocument();
    expect(screen.getByTestId('party-final-summary-panel')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.finalSummaryTitle')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'game.party.host.route.advanceStageCta' }),
    ).not.toBeInTheDocument();
  });

  it('renders the dedicated final leaderboard screen for ended host parties', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ status: PartyStatus.ENDED })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ENDED,
      context: {
        ...createRuntimeResultContext(),
        lifecycle: {
          phase: 'ended',
          stageEndsAtEpochMs: null,
          stageId: toStageId(1),
          stagePosition: 0,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.LEADERBOARD}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('host-runtime-surface')).toBeInTheDocument();
    expect(screen.getByTestId('party-final-summary-panel')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.finalSummaryTitle')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'game.party.host.route.advanceStageCta' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the final host player count aligned with standings when ranked players are no longer live', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ status: PartyStatus.ENDED })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ENDED,
      context: {
        ...createRuntimeResultContext(),
        lifecycle: {
          phase: 'ended',
          stageEndsAtEpochMs: null,
          stageId: toStageId(1),
          stagePosition: 0,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          joinedAt: '2026-04-21T08:00:00.000Z',
          totalScore: 0,
        }),
        createUserEntry(userIdentifier.parse(11), 'Player One', PartyRole.PLAYER, {
          avatarUri: '/avatars/player-one.png',
          joinedAt: '2026-04-21T08:01:00.000Z',
          totalScore: 1000,
        }),
        createGuestEntry(guestIdentifier.parse('guest-1'), 'Guest One', {
          avatarUri: '/avatars/guest.png',
          joinedAt: '2026-04-21T08:02:00.000Z',
          totalScore: 1000,
        }),
      ],
      liveObserverIdentities: [
        {
          kind: PartyPlayerIdentityKind.User,
          userId: userIdentifier.parse(11),
        },
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.LEADERBOARD}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    const standings = await screen.findByTestId('party-final-standings');

    expect(within(standings).getAllByRole('listitem')).toHaveLength(2);
    expect(standings).toHaveTextContent('Player One');
    expect(standings).toHaveTextContent('Guest One');
  });

  it('renders the generic player result surface with score feedback', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.pathname = '/party/9/stage/1/result';
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createRuntimeResultContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.RESULT}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-runtime-player-result-surface')).toBeInTheDocument();
    expect(screen.getByText('runtime-result.current-player.correct')).toBeInTheDocument();
    expect(screen.getByText('runtime-result.current-player.points:200')).toBeInTheDocument();
  });

  it('renders the player result surface when the host journey route provides stageId only via pathname', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.pathname = '/party/9/stage/1/result';
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createRuntimeResultContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.RESULT}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-runtime-player-result-surface')).toBeInTheDocument();
    expect(screen.queryByTestId('party-lobby-redirect')).not.toBeInTheDocument();
  });

  it('shows a player action error when the submit command is rejected', async () => {
    mocks.params = { partyId: '9', pin: undefined, stageId: '1' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.partyPlayerPort.submitAction = vi.fn(async () => {
      throw new Error('game.party.errors.partyCommandNotAvailable');
    });
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.ACTIVE,
      context: createActiveStageContext(),
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        screenSection={PartyScreenSection.STAGE}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Option A' }));

    expect(
      await screen.findByText('game.party.errors.partyCommandNotAvailable'),
    ).toBeInTheDocument();
  });

  it('does not rejoin a guest after leaving the lobby', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyGuestSessionPort.getGuestId = vi.fn(() => guestIdentifier.parse('guest-1'));
    mocks.partyManagementState.parties = [];
    mocks.partyPlayerPort.leaveParty = vi.fn(async () => true);
    mocks.partyPlayerPort.rejoinParty = vi.fn(async () => createRejectedJoinReceipt());
    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
        { kind: PartyPlayerIdentityKind.Guest, guestId: guestIdentifier.parse('guest-1') },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
        createGuestEntry(guestIdentifier.parse('guest-1'), 'Guest One', {
          avatarUri: '/avatars/guest.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:02:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    const view = renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.player.route.leavePartyCta' }),
    );

    expect(mocks.partyPlayerPort.leaveParty).not.toHaveBeenCalled();

    fireEvent.click(
      await screen.findByRole('button', { name: 'game.party.player.route.confirmLeavePartyCta' }),
    );

    await waitFor(() => {
      expect(mocks.partyPlayerPort.leaveParty).toHaveBeenCalledTimes(1);
    });

    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
      ],
    });

    view.rerender(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(mocks.partyPlayerPort.rejoinParty).not.toHaveBeenCalled();
    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/');
  });

  it('shows the invalid pin state before any observation starts', () => {
    mocks.params.pin = '   ';
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderScreen();

    expect(screen.getByRole('alert')).toHaveTextContent('game.party.route.invalidPin');
    expect(mocks.observationState.observePartyById).not.toHaveBeenCalled();

    mocks.params.pin = 'ab12cd';
  });

  it('renders observation errors while the lobby reconnects', async () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderScreen();

    expect(await screen.findByText('game.party.errors.partyNotFound')).toBeInTheDocument();
    expect(mocks.observationState.observePartyById).not.toHaveBeenCalled();
  });

  it('renders guest join controls when the visitor is not yet a player', async () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderScreen();

    expect(await screen.findByRole('banner')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('game.party.player.route.guestNameLabel'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'game.party.player.route.joinAsGuestCta' }),
    ).toBeDisabled();
    expect(
      screen.queryByText((content) => content.includes('errors.listFailed')),
    ).not.toBeInTheDocument();
  });

  it('enables guest join once the guest name is not empty', async () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderScreen();

    const joinButton = await screen.findByRole('button', {
      name: 'game.party.player.route.joinAsGuestCta',
    });

    fireEvent.change(await screen.findByLabelText('game.party.player.route.guestNameLabel'), {
      target: { value: '  Neo  ' },
    });

    expect(joinButton).toBeEnabled();
  });

  it('shows join errors in a toast notification', async () => {
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderScreen();

    fireEvent.change(await screen.findByLabelText('game.party.player.route.guestNameLabel'), {
      target: { value: 'Neo' },
    });

    const joinButton = screen.getByRole('button', {
      name: 'game.party.player.route.joinAsGuestCta',
    });

    await waitFor(() => {
      expect(joinButton).toBeEnabled();
    });

    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mocks.partyPlayerPort.joinParty).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByTestId('join-party-error-toast')).toHaveTextContent(
      'game.party.errors.joinFailed',
    );
    expect(screen.queryAllByRole('alert')).toHaveLength(1);
  });

  it('shows a rollback toast to players when the host sends the party back to the lobby', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      status: PartyStatus.WAITING,
      context: null,
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.currentRuntimeNotice = {
      kind: 'rewindParty',
      partyId: partyIdentifier.parse(9),
    };
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    const runtimeNoticeToast = await screen.findByTestId('party-runtime-notice-toast');

    expect(runtimeNoticeToast).toHaveTextContent('game.party.player.route.runtimeRewindPartyToast');
    expect(runtimeNoticeToast).toHaveAttribute(
      'style',
      expect.stringContaining(
        `background: color-mix(in srgb, ${uiThemeTokens.color.surface.overlay} 82%, ${uiThemeTokens.color.surface.warning})`,
      ),
    );
  });

  it('rejoins a persisted guest session after refreshing the canonical lobby route', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.partyGuestSessionPort.getGuestId = vi.fn(() => guestIdentifier.parse('guest-1'));
    mocks.partyPlayerPort.rejoinParty = vi.fn(
      async (): Promise<PartyJoinReceipt> => ({
        gameId: gameIdentifier.parse(17),
        player: {
          avatarUri: null,
          identity: {
            kind: PartyPlayerIdentityKind.Guest,
            guestId: guestIdentifier.parse('guest-1'),
          },
          username: 'Guest One',
        },
        partyId: partyIdentifier.parse(9),
        pin: partyPinIdentifier.parse('AB12CD'),
        status: PartyJoinReceiptStatus.ACCEPTED,
      }),
    );
    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolveJoinPartyRoute={(pin) => `/join/${pin}`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await waitFor(() => {
      expect(mocks.partyPlayerPort.rejoinParty).toHaveBeenCalledWith({
        pin: partyPinIdentifier.parse('AB12CD'),
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: guestIdentifier.parse('guest-1'),
        },
        username: undefined,
      });
    });

    expect(screen.queryByTestId('party-lobby-redirect')).not.toBeInTheDocument();
  });

  it('observes host lobby routes by party id', () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.observationState.currentParty = createPartyObservation();
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(mocks.observationState.observePartyById).toHaveBeenCalledWith(partyIdentifier.parse(9));
    expect(screen.getByText('game.party.host.route.shareHeading')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toHaveTextContent('https://pleey.localhost/join/AB12CD');

    mocks.params = { pin: 'ab12cd' };
  });

  it('does not restart host lobby observation on rerender', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.HOST })];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    const view = renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(mocks.observationState.observePartyById).toHaveBeenCalledTimes(1);
    expect(mocks.observationState.observePartyById).toHaveBeenCalledWith(partyIdentifier.parse(9));

    mocks.observationState.currentParty = createPartyObservation();

    await act(async () => {
      view.rerender(
        <PartyLobbyScreen
          routeKind={PartyLobbyRouteKind.PARTY_ID}
          normalizePin={(pin) =>
            pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
          }
          normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
          resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
        />,
      );
      await Promise.resolve();
    });

    expect(mocks.observationState.observePartyById).toHaveBeenCalledTimes(1);

    mocks.params = { pin: 'ab12cd' };
  });

  it('redirects authenticated hosts from the join route to their hosted party lobby', async () => {
    mocks.params = { pin: 'ab12cd' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PIN}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        resolvePartyLobbyRoute={(partyId) => `/party/${partyId}/lobby`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/party/9/lobby');
    expect(mocks.observationState.observePartyById).not.toHaveBeenCalled();
  });

  it('redirects authenticated players on the join route to their current active party lobby', async () => {
    mocks.params = { pin: 'ab12cd' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [
      createManagedParty({
        partyId: partyIdentifier.parse(12),
        role: PartyRole.PLAYER,
        pin: partyPinIdentifier.parse('ZX98YU'),
        status: PartyStatus.ACTIVE,
      }),
    ];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PIN}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        resolvePartyLobbyRoute={(partyId) => `/party/${partyId}/lobby`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/party/12/lobby');
    expect(mocks.observationState.observePartyById).not.toHaveBeenCalled();
  });

  it('redirects non-players from the host lobby route to the join page', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 42,
        username: 'Visitor',
        email: 'visitor@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [];
    mocks.partyGuestSessionPort.getGuestId = vi.fn(() => null);
    mocks.observationState.currentParty = createPartyObservation({
      players: [
        partyFixtureFactory.createObservationPlayer({
          avatarUri: '/avatars/neo.png',
          identity: { kind: PartyPlayerIdentityKind.User, userId: 11 },
          isCurrentPlayer: false,
          isLive: true,
          totalScore: 0,
          username: 'Neo',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolveJoinPartyRoute={(pin) => `/join/${pin}`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/join/AB12CD');
    expect(mocks.observationState.observePartyById).toHaveBeenCalledWith(partyIdentifier.parse(9));

    mocks.params = { pin: 'ab12cd' };
  });

  it('redirects players from the join route to the canonical party lobby once joined', async () => {
    mocks.params = { pin: 'ab12cd' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 11,
        username: 'Neo',
        email: 'neo@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty({ role: PartyRole.PLAYER })];
    mocks.observationState.currentParty = createPartyObservation({
      entries: [
        createUserEntry(userIdentifier.parse(11), 'Neo', PartyRole.PLAYER, {
          avatarUri: null,
          totalScore: 0,
          joinedAt: '2026-04-21T08:01:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PIN}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        resolvePartyLobbyRoute={(partyId) => `/party/${partyId}/lobby`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/party/9/lobby');
  });

  it('redirects persisted guests from the join route to their current party lobby', async () => {
    mocks.params = { pin: 'ab12cd' };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: false,
      user: null,
    };
    mocks.partyManagementState.parties = [];
    mocks.partyGuestSessionPort.getGuestId = vi.fn(() => guestIdentifier.parse('guest-1'));
    mocks.partyPlayerPort.rejoinParty = vi.fn(
      async (): Promise<PartyJoinReceipt> => ({
        gameId: gameIdentifier.parse(17),
        player: {
          avatarUri: '/avatars/guest.png',
          identity: {
            kind: PartyPlayerIdentityKind.Guest,
            guestId: guestIdentifier.parse('guest-1'),
          },
          username: 'Guest One',
        },
        partyId: partyIdentifier.parse(9),
        pin: partyPinIdentifier.parse('AB12CD'),
        status: PartyJoinReceiptStatus.ACCEPTED,
      }),
    );
    mocks.observationState.currentParty = createPartyObservation({
      liveObserverIdentities: [
        { kind: PartyPlayerIdentityKind.User, userId: userIdentifier.parse(7) },
        { kind: PartyPlayerIdentityKind.Guest, guestId: guestIdentifier.parse('guest-1') },
      ],
      entries: [
        createUserEntry(userIdentifier.parse(7), 'Host', PartyRole.HOST, {
          avatarUri: '/avatars/host.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:00:00.000Z',
        }),
        createGuestEntry(guestIdentifier.parse('guest-1'), 'Guest One', {
          avatarUri: '/avatars/guest.png',
          totalScore: 0,
          joinedAt: '2026-04-21T08:02:00.000Z',
        }),
      ],
    });
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PIN}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        resolvePartyLobbyRoute={(partyId) => `/party/${partyId}/lobby`}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    await waitFor(() => {
      expect(mocks.partyPlayerPort.rejoinParty).toHaveBeenCalledWith({
        pin: partyPinIdentifier.parse('AB12CD'),
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: guestIdentifier.parse('guest-1'),
        },
        username: undefined,
      });
    });

    expect(await screen.findByTestId('party-lobby-redirect')).toHaveTextContent('/party/9/lobby');
  });

  it('bootstraps host lobby routes by pin when the party id observation is still empty', async () => {
    mocks.params = { partyId: '9', pin: undefined };
    mocks.authState = {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: authFixtureFactory.createUser({
        id: 7,
        username: 'Host',
        email: 'host@pleey.io',
        avatarUri: null,
      }),
    };
    mocks.partyManagementState.parties = [createManagedParty()];
    mocks.observationState.currentParty = null;
    mocks.observationState.currentErrorMessage = null;
    mocks.observationState.currentErrorPartyId = null;
    mocks.observationState.observePartyById = vi.fn(() => vi.fn());

    renderWithProviders(
      <PartyLobbyScreen
        routeKind={PartyLobbyRouteKind.PARTY_ID}
        normalizePin={(pin) =>
          pin?.trim() ? partyPinIdentifier.parse(pin.trim().toUpperCase()) : null
        }
        normalizePartyId={(partyId) => (partyId ? partyIdentifier.parse(Number(partyId)) : null)}
        resolvePartyAbsoluteUrl={(pin) => `https://pleey.localhost/join/${pin}`}
      />,
    );

    expect(await screen.findByText('game.party.route.loading')).toBeInTheDocument();
    expect(mocks.observationState.observePartyById).toHaveBeenCalledWith(partyIdentifier.parse(9));

    mocks.params = { pin: 'ab12cd' };
    mocks.partyManagementState.parties = [];
  });
});
