import { injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { KeyboardShortcutsProvider } from '../../../../presentation/shared/keyboard';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

function AppKeyboardShortcutsProvider({ children }: PropsWithChildren) {
  return createElement(KeyboardShortcutsProvider, undefined, children);
}

@injectable()
export class AppKeyboardShortcutsProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.KEYBOARD;

  protected create(children: ReactNode): ReactNode {
    return createElement(AppKeyboardShortcutsProvider, undefined, children);
  }
}
