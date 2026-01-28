import { createContext, type PropsWithChildren, useContext } from 'react';
import type { LeaderboardEntry } from '../../../../../domains/game-session/entities/leaderboard-entry';
import type { SortedLeaderboardResult } from '../../../../../domains/game-session/entities/leaderboard-result';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

export interface LeaderboardPort {
  sortEntries(entries: readonly LeaderboardEntry[]): SortedLeaderboardResult;
  findCurrentPlayer(
    entries: readonly LeaderboardEntry[],
    userId: number | null,
    guestNickname: string,
  ): LeaderboardEntry | null;
  isSameEntry(entry: LeaderboardEntry, other: LeaderboardEntry | null): boolean;
}

const GameLeaderboardContext = createContext<LeaderboardPort | null>(null);

interface GameLeaderboardProviderProps extends PropsWithChildren {
  readonly value: LeaderboardPort;
}

export function GameLeaderboardProvider({ children, value }: GameLeaderboardProviderProps) {
  return (
    <GameLeaderboardContext.Provider value={value}>{children}</GameLeaderboardContext.Provider>
  );
}

export function useGameLeaderboard(): LeaderboardPort {
  const value = useContext(GameLeaderboardContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PROVIDER_REQUIRED);
  }

  return value;
}
