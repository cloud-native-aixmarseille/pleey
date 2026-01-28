import type { PropsWithChildren } from 'react';
import { AppGameHostControlProvider } from '../host/providers/app-game-host-control-provider';
import { AppGameLobbyProvider } from '../player/providers/app-game-lobby-provider';
import { AppGamePlayingProvider } from '../player/providers/app-game-playing-provider';

export function AppGameSessionRuntimeProvider({ children }: PropsWithChildren) {
  return (
    <AppGameLobbyProvider>
      <AppGamePlayingProvider>
        <AppGameHostControlProvider>{children}</AppGameHostControlProvider>
      </AppGamePlayingProvider>
    </AppGameLobbyProvider>
  );
}
