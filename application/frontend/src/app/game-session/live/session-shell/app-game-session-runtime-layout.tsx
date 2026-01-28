import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { HostCommandBarStateFacade } from '../../../../application/game-session/live/host/facades/host-command-bar-state.facade';
import { HostCommandBar } from '../../../../presentation/game-session/live/host/screens/runtime/components/host-command-bar';
import { runtimeContainer } from '../../../composition/runtime-container';
import { AppGameSessionRuntimeProvider } from './app-game-session-runtime-provider';

export function AppGameSessionRuntimeLayout() {
  const hostCommandBarStateFacadeRef = useRef<HostCommandBarStateFacade | null>(null);

  if (!hostCommandBarStateFacadeRef.current) {
    hostCommandBarStateFacadeRef.current = runtimeContainer.get(HostCommandBarStateFacade);
  }

  const hostCommandBarStateFacade = hostCommandBarStateFacadeRef.current;

  if (!hostCommandBarStateFacade) {
    throw new Error('HostCommandBarStateFacade is not available');
  }

  return (
    <AppGameSessionRuntimeProvider>
      <Outlet />
      <HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />
    </AppGameSessionRuntimeProvider>
  );
}
