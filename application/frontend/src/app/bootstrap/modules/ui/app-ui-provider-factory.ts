import { injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { MantineUiAdapter } from '../../../../infrastructure/ui/mantine-ui.adapter';
import {
  PresentationUiProvider,
  PresentationUiRoot,
} from '../../../../presentation/shared/ui/provider';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

const uiPort = new MantineUiAdapter().createPort();

function AppUiProvider({ children }: PropsWithChildren) {
  return createElement(
    PresentationUiProvider,
    { value: uiPort },
    createElement(PresentationUiRoot, undefined, children),
  );
}

@injectable()
export class AppUiProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.UI;

  protected create(children: ReactNode): ReactNode {
    return createElement(AppUiProvider, undefined, children);
  }
}
