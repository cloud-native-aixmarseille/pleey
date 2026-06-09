import { ContainerModule } from 'inversify';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppKeyboardShortcutsProviderFactory } from './app-keyboard-shortcuts-provider-factory';

export const keyboardContainerModule = new ContainerModule(({ bind }) => {
  bind(AppKeyboardShortcutsProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppKeyboardShortcutsProviderFactory);
});
