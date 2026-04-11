import { ContainerModule } from 'inversify';
import { StoragePortToken } from '../../../../domains/shared/ports/storage.port';
import { LocalStorageAdapter } from '../../../../infrastructure/storage/local-storage.adapter';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppTranslationProviderFactory } from './app-translation-provider-factory';

export const translationContainerModule = new ContainerModule(({ bind }) => {
  bind(LocalStorageAdapter).toSelf().inSingletonScope();
  bind(StoragePortToken).toService(LocalStorageAdapter);
  bind(AppTranslationProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppTranslationProviderFactory);
});
