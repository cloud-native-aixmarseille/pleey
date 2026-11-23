import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { type StoragePort, StoragePortToken } from '../../../../domains/shared/ports/storage.port';
import { useReactI18nextTranslationAdapter } from '../../../../infrastructure/i18n/react-i18next-translation.adapter';
import { PresentationTranslationProvider } from '../../../../presentation/shared/i18n/use-presentation-translation';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppTranslationProviderProps extends PropsWithChildren {
  readonly storagePort: StoragePort;
}

function AppTranslationProvider({ children, storagePort }: AppTranslationProviderProps) {
  const translationPort = useReactI18nextTranslationAdapter(storagePort);

  return createElement(PresentationTranslationProvider, { value: translationPort }, children);
}

@injectable()
export class AppTranslationProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.TRANSLATION;

  constructor(@inject(StoragePortToken) private readonly storagePort: StoragePort) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    return createElement(AppTranslationProvider, { storagePort: this.storagePort }, children);
  }
}
