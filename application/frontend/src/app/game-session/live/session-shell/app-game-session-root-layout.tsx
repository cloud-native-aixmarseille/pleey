import { Outlet } from 'react-router-dom';
import { AppGameProvider } from '../player/providers/app-game-provider';
import { AppGameTypeLiveRegistryProvider } from '../shared/providers/app-game-type-live-registry-provider';

export function AppGameSessionRootLayout() {
  return (
    <AppGameProvider>
      <AppGameTypeLiveRegistryProvider>
        <Outlet />
      </AppGameTypeLiveRegistryProvider>
    </AppGameProvider>
  );
}
