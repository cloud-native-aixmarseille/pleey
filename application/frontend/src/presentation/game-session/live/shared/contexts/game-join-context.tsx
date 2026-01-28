import { createContext, type PropsWithChildren, useContext } from 'react';
import type { GameJoinErrorCode } from '../../../../../domains/game-session/errors/game-join-error-code';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

interface JoinGameFlowPort {
  readonly expectedPinLength: number;
  normalizePin(pin?: string): string;
  truncatePin(pin?: string): string;
  isPinComplete(pin: string): boolean;
  validatePin(pin: string): GameJoinErrorCode | null;
  sanitizeDisplayName(value?: string): string;
  hasDisplayName(value?: string): boolean;
  hasPlayerIdentity(isAuthenticated: boolean, guestNickname?: string): boolean;
}

interface AuthenticatedJoinGameInput {
  readonly pin: string;
  readonly userId: number;
  readonly username: string;
}

interface GuestJoinGameInput {
  readonly pin: string;
  readonly nickname: string;
}

interface AuthenticatedJoinGameRequestReceipt {
  readonly pin: string;
  readonly username: string;
}

interface GuestJoinGameRequestReceipt {
  readonly avatarUri?: string | null;
  readonly guestId: string;
  readonly pin: string;
  readonly username: string;
}

export type JoinGameRequestReceipt =
  | AuthenticatedJoinGameRequestReceipt
  | GuestJoinGameRequestReceipt;

export interface GameJoinContextValue {
  readonly joinGameFlow: JoinGameFlowPort;
  readonly errorCode: GameJoinErrorCode | null;
  readonly guestNickname: string;
  readonly isSubmitting: boolean;
  readonly lastJoinRequest: JoinGameRequestReceipt | null;
  clearError(): void;
  joinAsAuthenticated(input: AuthenticatedJoinGameInput): Promise<void>;
  joinAsGuest(input: GuestJoinGameInput): Promise<void>;
}

const GameJoinContext = createContext<GameJoinContextValue | null>(null);

interface GameJoinProviderProps extends PropsWithChildren {
  readonly value: GameJoinContextValue;
}

export function GameJoinProvider({ children, value }: GameJoinProviderProps) {
  return <GameJoinContext.Provider value={value}>{children}</GameJoinContext.Provider>;
}

export function useGameJoin(): GameJoinContextValue {
  const value = useContext(GameJoinContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PROVIDER_REQUIRED);
  }

  return value;
}
