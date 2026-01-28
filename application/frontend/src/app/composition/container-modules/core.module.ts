import { ContainerModule } from 'inversify';
import { LemmingsPlatformService } from '../../../presentation/shared/ui/patience/variants/lemmings/lemmings-platform-service';
import { RouteRegistry } from '../../routing/route-registry';
import { TOKENS } from '../tokens';

export const coreModule = new ContainerModule(({ bind }) => {
  bind<RouteRegistry>(TOKENS.routeRegistry).to(RouteRegistry).inSingletonScope();
  bind(LemmingsPlatformService).toSelf().inSingletonScope();
});
