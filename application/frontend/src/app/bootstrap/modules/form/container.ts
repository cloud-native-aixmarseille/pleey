import { ContainerModule } from 'inversify';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppFormProviderFactory } from './app-form-provider-factory';

export const formContainerModule = new ContainerModule(({ bind }) => {
  bind(AppFormProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppFormProviderFactory);
});
