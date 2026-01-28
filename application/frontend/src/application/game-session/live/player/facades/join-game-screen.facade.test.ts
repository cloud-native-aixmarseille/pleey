import { describe, expect, it, vi } from 'vitest';
import { GameJoinErrorCode } from '../../../../../domains/game-session/errors/game-join-error-code';
import { JoinGameScreenFacade } from './join-game-screen.facade';

describe('JoinGameScreenFacade', () => {
  const facade = new JoinGameScreenFacade();

  it('hydrates guest nickname only when the current nickname is empty', () => {
    expect(facade.shouldHydrateNickname('Guest Pilot', '')).toBe(true);
    expect(facade.shouldHydrateNickname('Guest Pilot', 'Trinity')).toBe(false);
  });

  it('builds a semantic request message for guest joins', () => {
    expect(
      facade.buildRequestMessage(
        { guestId: 'guest-1', pin: 'AB12CD', username: 'Trinity' },
        (key, values) => `${key}:${values?.pin}:${values?.username}`,
      ),
    ).toBe('game.join.requestSentGuest:AB12CD:Trinity');
  });

  it('returns a guest-step outcome for valid anonymous pins', async () => {
    await expect(
      facade.continueJoin({
        clearError: vi.fn(),
        flowService: {
          truncatePin: vi.fn(),
          validatePin: vi.fn().mockReturnValue(null),
        },
        normalizedPin: 'AB12CD',
        isAuthenticated: false,
        user: null,
        joinAsAuthenticated: vi.fn(),
        resolveLobbyRoute: (pin) => `/game/${pin}/lobby`,
      }),
    ).resolves.toEqual({ type: 'show-guest-step' });
  });

  it('navigates authenticated players after a successful join dispatch', async () => {
    const joinAsAuthenticated = vi.fn().mockResolvedValue(undefined);

    await expect(
      facade.continueJoin({
        clearError: vi.fn(),
        flowService: {
          truncatePin: vi.fn(),
          validatePin: vi.fn().mockReturnValue(null),
        },
        normalizedPin: 'AB12CD',
        isAuthenticated: true,
        user: { id: 7, username: 'Neo' },
        joinAsAuthenticated,
        resolveLobbyRoute: (pin) => `/game/${pin}/lobby`,
      }),
    ).resolves.toEqual({ type: 'navigate', route: '/game/AB12CD/lobby' });

    expect(joinAsAuthenticated).toHaveBeenCalledWith({
      pin: 'AB12CD',
      userId: 7,
      username: 'Neo',
    });
  });

  it('keeps the user on the current step when validation fails', async () => {
    await expect(
      facade.completeGuestJoin({
        clearError: vi.fn(),
        flowService: {
          truncatePin: vi.fn(),
          validatePin: vi.fn().mockReturnValue(GameJoinErrorCode.PIN_INVALID),
        },
        normalizedPin: 'BAD',
        normalizedNickname: 'Trinity',
        joinAsGuest: vi.fn(),
        resolveLobbyRoute: (pin) => `/game/${pin}/lobby`,
      }),
    ).resolves.toEqual({ type: 'invalid' });
  });
});
