import { injectable } from 'inversify';
import { GameJoinErrorCode } from '../../../../../domains/game-session/errors/game-join-error-code';

interface JoinGameFlowLike {
  truncatePin(pin: string): string;
  validatePin(pin: string): GameJoinErrorCode | null;
}

interface JoinRequestLike {
  readonly guestId?: string;
  readonly pin: string;
  readonly username?: string;
}

interface AuthenticatedUserLike {
  readonly id: number;
  readonly username: string;
}

interface TranslateLike {
  (key: string, values?: Record<string, string>): string;
}

type ContinueJoinOutcome =
  | { readonly type: 'invalid' }
  | { readonly type: 'show-guest-step' }
  | { readonly type: 'navigate'; readonly route: string };

type GuestJoinOutcome =
  | { readonly type: 'invalid' }
  | { readonly type: 'navigate'; readonly route: string };

@injectable()
export class JoinGameScreenFacade {
  shouldHydrateNickname(guestNickname: string, currentNickname: string): boolean {
    return guestNickname.trim().length > 0 && currentNickname.trim().length === 0;
  }

  shouldHydratePin(prefilledPin: string, currentPin: string): boolean {
    return prefilledPin.length > 0 && currentPin.length === 0;
  }

  resolveNicknameErrorCode(
    nicknameTouched: boolean,
    normalizedNickname: string,
  ): GameJoinErrorCode | null {
    return nicknameTouched && normalizedNickname.length === 0
      ? GameJoinErrorCode.DISPLAY_NAME_REQUIRED
      : null;
  }

  buildRequestMessage(
    lastJoinRequest: JoinRequestLike | null,
    translate: TranslateLike,
  ): string | null {
    if (lastJoinRequest === null) {
      return null;
    }

    return translate(
      lastJoinRequest.guestId === undefined
        ? 'game.join.requestSentAuthenticated'
        : 'game.join.requestSentGuest',
      {
        pin: lastJoinRequest.pin,
        username: lastJoinRequest.username ?? '',
      },
    );
  }

  async continueJoin(input: {
    readonly clearError: () => void;
    readonly flowService: JoinGameFlowLike;
    readonly normalizedPin: string;
    readonly isAuthenticated: boolean;
    readonly user: AuthenticatedUserLike | null;
    readonly joinAsAuthenticated: (input: {
      pin: string;
      userId: number;
      username: string;
    }) => Promise<void>;
    readonly resolveLobbyRoute: (pin: string) => string;
  }): Promise<ContinueJoinOutcome> {
    input.clearError();

    const pinError = input.flowService.validatePin(input.normalizedPin);

    if (pinError) {
      return { type: 'invalid' };
    }

    if (input.isAuthenticated && input.user) {
      await input.joinAsAuthenticated({
        pin: input.normalizedPin,
        userId: input.user.id,
        username: input.user.username,
      });

      return {
        type: 'navigate',
        route: input.resolveLobbyRoute(input.normalizedPin),
      };
    }

    return { type: 'show-guest-step' };
  }

  async completeGuestJoin(input: {
    readonly clearError: () => void;
    readonly flowService: JoinGameFlowLike;
    readonly normalizedPin: string;
    readonly normalizedNickname: string;
    readonly joinAsGuest: (input: { pin: string; nickname: string }) => Promise<void>;
    readonly resolveLobbyRoute: (pin: string) => string;
  }): Promise<GuestJoinOutcome> {
    input.clearError();

    const pinError = input.flowService.validatePin(input.normalizedPin);

    if (pinError || input.normalizedNickname.length === 0) {
      return { type: 'invalid' };
    }

    await input.joinAsGuest({
      pin: input.normalizedPin,
      nickname: input.normalizedNickname,
    });

    return {
      type: 'navigate',
      route: input.resolveLobbyRoute(input.normalizedPin),
    };
  }
}
