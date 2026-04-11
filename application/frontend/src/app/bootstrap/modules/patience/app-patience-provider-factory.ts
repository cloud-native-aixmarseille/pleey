import { injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { PatienceHost } from '../../../../presentation/shared/ui/patience';
import {
  type PatienceAnimationRegistry,
  PatienceAnimationRegistryProvider,
} from '../../../../presentation/shared/ui/patience/patience-animation-registry-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppPatienceProviderProps extends PropsWithChildren {
  readonly animations: PatienceAnimationRegistry;
}

function AppPatienceProvider({ animations, children }: AppPatienceProviderProps) {
  return createElement(
    PatienceAnimationRegistryProvider,
    { value: animations },
    createElement(PatienceHost, undefined, children),
  );
}

@injectable()
export class AppPatienceProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.PATIENCE;

  constructor(private readonly animations: PatienceAnimationRegistry) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    return createElement(AppPatienceProvider, { animations: this.animations }, children);
  }
}
