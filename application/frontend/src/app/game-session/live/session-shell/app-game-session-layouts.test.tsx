import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock('../player/providers/app-game-provider', () => ({
  AppGameProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="game-provider">{children}</div>
  ),
}));

vi.mock('../shared/providers/app-game-type-live-registry-provider', () => ({
  AppGameTypeLiveRegistryProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="type-live-registry-provider">{children}</div>
  ),
}));

vi.mock('./app-game-session-runtime-provider', () => ({
  AppGameSessionRuntimeProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="session-runtime-provider">{children}</div>
  ),
}));

vi.mock(
  '../../../../presentation/game-session/live/host/screens/runtime/components/host-command-bar',
  () => ({
    HostCommandBar: () => <div data-testid="host-command-bar" />,
  }),
);

vi.mock('../../../composition/runtime-container', () => ({
  runtimeContainer: {
    get: () => ({}) as object,
  },
}));

import { AppGameSessionRootLayout } from './app-game-session-root-layout';
import { AppGameSessionRuntimeLayout } from './app-game-session-runtime-layout';

describe('AppGameSessionRootLayout', () => {
  it('wraps the outlet with the root game-session providers', () => {
    render(<AppGameSessionRootLayout />);

    expect(screen.getByTestId('game-provider')).toBeInTheDocument();
    expect(screen.getByTestId('type-live-registry-provider')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});

describe('AppGameSessionRuntimeLayout', () => {
  it('wraps the outlet with the runtime provider and mounts the host command bar', () => {
    render(<AppGameSessionRuntimeLayout />);

    expect(screen.getByTestId('session-runtime-provider')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('host-command-bar')).toBeInTheDocument();
  });
});
