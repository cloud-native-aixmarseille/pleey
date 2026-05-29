import { ContainerModule } from 'inversify';
import { TranslationPortToken } from '../../../../application/shared/contracts/translation.port';
import { StoragePortToken } from '../../../../domains/shared/ports/storage.port';
import { I18nextTranslationAdapter } from '../../../../infrastructure/i18n/i18next-translation.adapter';
import { LocalStorageAdapter } from '../../../../infrastructure/storage/local-storage.adapter';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppTranslationProviderFactory } from './app-translation-provider-factory';

export const translationContainerModule = new ContainerModule(({ bind }) => {
  bind(LocalStorageAdapter).toSelf().inSingletonScope();
  bind(I18nextTranslationAdapter).toSelf().inSingletonScope();
  bind(StoragePortToken).toService(LocalStorageAdapter);
  bind(TranslationPortToken).toService(I18nextTranslationAdapter);
  bind(AppTranslationProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppTranslationProviderFactory);
});
