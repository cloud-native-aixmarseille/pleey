import { injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { ReactRouterRoutingAdapter } from '../../../../infrastructure/routing/react-router-routing.adapter';
import { PresentationRoutingProvider } from '../../../../presentation/shared/routing/router';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

const routingPort = new ReactRouterRoutingAdapter().createPort();

function AppRoutingProvider({ children }: PropsWithChildren) {
  return createElement(PresentationRoutingProvider, { value: routingPort }, children);
}

@injectable()
export class AppRoutingProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.ROUTING;

  protected create(children: ReactNode): ReactNode {
    return createElement(AppRoutingProvider, undefined, children);
  }
}
