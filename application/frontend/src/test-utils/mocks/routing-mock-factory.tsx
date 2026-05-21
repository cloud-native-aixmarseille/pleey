import { type ComponentType, createElement } from 'react';
import { vi } from 'vitest';
import type {
  CreateLinkFn,
  PresentationNavigate,
  PresentationParams,
  RoutingPort,
} from '../../application/shared/contracts/routing.port';

interface RoutingPortOverrides {
  readonly navigate?: PresentationNavigate;
  readonly Outlet?: ComponentType;
  readonly pathname?: string;
  readonly params?: PresentationParams;
}

interface RoutingModuleOverrides {
  readonly navigate?: PresentationNavigate;
  readonly pathname?: string;
  readonly params?: PresentationParams;
}

export class RoutingMockFactory {
  createLink(): CreateLinkFn {
    return <TProps extends object>(component: ComponentType<TProps>) => {
      return function MockCreatedLink({ to, ...rest }: { to: string } & Omit<TProps, 'href'>) {
        const Component = component as ComponentType<TProps & { href?: string }>;

        return createElement(Component, {
          ...(rest as TProps),
          href: to,
        });
      };
    };
  }

  createRoutingPort(overrides: RoutingPortOverrides = {}): RoutingPort {
    const navigate = overrides.navigate ?? vi.fn();
    const Outlet = overrides.Outlet ?? (() => null);
    const pathname = overrides.pathname ?? '/';
    const params = overrides.params ?? {};

    return {
      createLink: this.createLink(),
      Navigate: ({ to }: { to: string }) =>
        createElement('div', { 'data-testid': `navigate-${to}` }),
      Outlet,
      useNavigate: () => navigate,
      usePathname: () => pathname,
      useParams: () => params,
    };
  }

  createModule(overrides: RoutingModuleOverrides = {}) {
    const navigate = overrides.navigate ?? vi.fn();
    const pathname = overrides.pathname ?? '/';
    const params = overrides.params ?? {};

    return {
      createLink: this.createLink(),
      usePresentationNavigate: () => navigate,
      usePresentationPathname: () => pathname,
      usePresentationParams: () => params,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: RoutingModuleOverrides = {},
  ): Promise<TModule & ReturnType<RoutingMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }
}
