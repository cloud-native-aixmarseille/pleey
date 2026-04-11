import { Container, type ContainerModule } from 'inversify';
import { formContainerModule } from './modules/form/container';
import { identityContainerModule } from './modules/identity/container';
import { partyContainerModule } from './modules/party/container';
import { patienceContainerModule } from './modules/patience/container';
import { routingContainerModule } from './modules/routing/container';
import { translationContainerModule } from './modules/translation/container';
import { uiContainerModule } from './modules/ui/container';
import { workspaceContainerModule } from './modules/workspace/container';

const bootstrapContainerModules = [
  uiContainerModule,
  translationContainerModule,
  routingContainerModule,
  formContainerModule,
  identityContainerModule,
  patienceContainerModule,
  workspaceContainerModule,
  partyContainerModule,
] as const satisfies readonly ContainerModule[];

export function createAppContainer(): Container {
  const container = new Container({ defaultScope: 'Singleton' });
  container.loadSync(...bootstrapContainerModules);
  return container;
}
