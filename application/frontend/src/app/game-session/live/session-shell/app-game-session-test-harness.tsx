import type { PropsWithChildren } from 'react';
import { GameSessionRoutingService } from '../../../../domains/game-session/services/game-session-routing-service';
import { GameSessionRouteProvider } from '../../../../presentation/shared/routing/game-session-route-context';
import { AppGameProvider } from '../player/providers/app-game-provider';
import { AppGameTypeLiveRegistryProvider } from '../shared/providers/app-game-type-live-registry-provider';
import { createAppGameSessionRouteBindings } from './app-game-session-routes-factory';
import { AppGameSessionRuntimeProvider } from './app-game-session-runtime-provider';

const gameSessionRoutingService = new GameSessionRoutingService();
const gameSessionRoutes = createAppGameSessionRouteBindings(gameSessionRoutingService);

export function AppGameSessionTestHarness({ children }: PropsWithChildren) {
  return (
    <GameSessionRouteProvider value={gameSessionRoutes}>
      <AppGameProvider>
        <AppGameTypeLiveRegistryProvider>
          <AppGameSessionRuntimeProvider>{children}</AppGameSessionRuntimeProvider>
        </AppGameTypeLiveRegistryProvider>
      </AppGameProvider>
    </GameSessionRouteProvider>
  );
}
