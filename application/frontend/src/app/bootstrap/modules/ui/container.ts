import { ContainerModule } from 'inversify';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppUiProviderFactory } from './app-ui-provider-factory';

export const uiContainerModule = new ContainerModule(({ bind }) => {
  bind(AppUiProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppUiProviderFactory);
});
