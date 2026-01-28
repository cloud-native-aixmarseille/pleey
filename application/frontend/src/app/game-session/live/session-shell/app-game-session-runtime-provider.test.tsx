import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../host/providers/app-game-host-control-provider', () => ({
  AppGameHostControlProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="host-control-provider">{children}</div>
  ),
}));

vi.mock('../player/providers/app-game-lobby-provider', () => ({
  AppGameLobbyProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="lobby-provider">{children}</div>
  ),
}));

vi.mock('../player/providers/app-game-playing-provider', () => ({
  AppGamePlayingProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="playing-provider">{children}</div>
  ),
}));

import { AppGameSessionRuntimeProvider } from './app-game-session-runtime-provider';

describe('AppGameSessionRuntimeProvider', () => {
  it('renders the live runtime provider stack around its children', () => {
    render(
      <AppGameSessionRuntimeProvider>
        <div data-testid="content">content</div>
      </AppGameSessionRuntimeProvider>,
    );

    expect(screen.getByTestId('lobby-provider')).toBeInTheDocument();
    expect(screen.getByTestId('playing-provider')).toBeInTheDocument();
    expect(screen.getByTestId('host-control-provider')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
