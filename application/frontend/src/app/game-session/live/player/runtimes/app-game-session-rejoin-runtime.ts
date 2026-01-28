import { inject, injectable } from 'inversify';
import { JoinGameUseCase } from '../../../../../application/game-session/live/player/use-cases/join-game-use-case';
import type { User } from '../../../../../domains/auth/entities/user';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import type { JoinGameRequestReceipt } from '../../../../../presentation/game-session/live/shared/contexts/game-join-context';
import { AppGuestPlayerRuntime } from './app-guest-player-runtime';

interface ReplayGameSessionJoinCommand {
  readonly pin: string;
  readonly hasRestoredSession: boolean;
  readonly lastJoinRequest: JoinGameRequestReceipt | null;
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly lastDispatchKey: string | null;
}

@injectable()
export class AppGameSessionRejoinRuntime {
  constructor(
    @inject(AppGuestPlayerRuntime)
    private readonly guestPlayerService: AppGuestPlayerRuntime,
    @inject(JoinGameUseCase)
    private readonly joinGameUseCase: JoinGameUseCase,
    @inject(JoinGameFlowService)
    private readonly joinGameFlowService: JoinGameFlowService,
  ) {}

  replayForSession(command: ReplayGameSessionJoinCommand): string | null {
    if (!command.hasRestoredSession) {
      return null;
    }

    const normalizedPin = this.joinGameFlowService.normalizePin(command.pin);
    if (!normalizedPin) {
      return null;
    }

    const restoredGuest = this.guestPlayerService.restore();

    if (command.isAuthenticated && command.user) {
      const dispatchKey = this.buildDispatchKey(
        normalizedPin,
        'authenticated',
        String(command.user.id),
      );

      if (command.lastDispatchKey === dispatchKey) {
        return dispatchKey;
      }

      this.joinGameUseCase.execute({
        pin: normalizedPin,
        userId: command.user.id,
        username: command.user.username,
      });

      return dispatchKey;
    }

    if (!restoredGuest) {
      return null;
    }

    const dispatchKey = this.buildDispatchKey(normalizedPin, 'guest', restoredGuest.id);

    if (
      this.shouldReuseLastJoinRequest({
        normalizedPin,
        lastJoinRequest: command.lastJoinRequest,
        isAuthenticated: false,
        authenticatedUsername: command.user?.username,
        guestNickname: restoredGuest.nickname,
      }) ||
      command.lastDispatchKey === dispatchKey
    ) {
      return dispatchKey;
    }

    this.joinGameUseCase.execute({
      pin: normalizedPin,
      guestId: restoredGuest.id,
      username: restoredGuest.nickname,
    });

    return dispatchKey;
  }

  private shouldReuseLastJoinRequest(args: {
    readonly normalizedPin: string;
    readonly lastJoinRequest: JoinGameRequestReceipt | null;
    readonly isAuthenticated: boolean;
    readonly authenticatedUsername?: string;
    readonly guestNickname?: string;
  }): boolean {
    const {
      normalizedPin,
      lastJoinRequest,
      isAuthenticated,
      authenticatedUsername,
      guestNickname,
    } = args;

    if (lastJoinRequest?.pin !== normalizedPin) {
      return false;
    }

    if (!('guestId' in lastJoinRequest)) {
      return isAuthenticated && authenticatedUsername === lastJoinRequest.username;
    }

    return !isAuthenticated && guestNickname === lastJoinRequest.username;
  }

  private buildDispatchKey(
    pin: string,
    principalKind: 'authenticated' | 'guest',
    principal: string,
  ): string {
    return `${pin}:${principalKind}:${principal}`;
  }
}
