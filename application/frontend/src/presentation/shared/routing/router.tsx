import {
  type ComponentType,
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useRef,
} from 'react';
import type {
  PresentationNavigate,
  PresentationParams,
  RoutingPort,
} from '../../../application/shared/contracts/routing.port';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

const RoutingContext = createContext<RoutingPort | null>(null);

interface PresentationRoutingProviderProps extends PropsWithChildren {
  readonly value: RoutingPort;
}

export function PresentationRoutingProvider({ children, value }: PresentationRoutingProviderProps) {
  return <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>;
}

function usePresentationRouting(): RoutingPort {
  const port = useContext(RoutingContext);

  if (!port) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_ROUTING_PROVIDER_REQUIRED);
  }

  return port;
}

export function createLink<TProps extends object>(
  component: ComponentType<TProps>,
): ComponentType<{ to: string } & Omit<TProps, 'href'>> {
  return function CreatedLink({ to, ...rest }: { to: string } & Omit<TProps, 'href'>) {
    const { createLink: portFactory } = usePresentationRouting();
    const implRef = useRef<ComponentType<{ to: string } & Omit<TProps, 'href'>> | null>(null);
    if (implRef.current === null) {
      implRef.current = portFactory(component);
    }
    const Impl = implRef.current;
    const forwardedProps = rest as unknown as Omit<TProps, 'href'>;
    return createElement(Impl, {
      to,
      ...forwardedProps,
    } as { to: string } & Omit<TProps, 'href'>);
  };
}

export function PresentationRedirect({
  to,
  replace = true,
}: {
  readonly to: string;
  readonly replace?: boolean;
}) {
  const { Navigate: NavigateComponent } = usePresentationRouting();

  return <NavigateComponent replace={replace} to={to} />;
}

export function usePresentationNavigate(): PresentationNavigate {
  const { useNavigate } = usePresentationRouting();

  return useNavigate();
}

export function usePresentationPathname(): string {
  const { usePathname } = usePresentationRouting();

  return usePathname();
}

export function usePresentationParams<TKey extends string = string>(): PresentationParams<TKey> {
  const { useParams } = usePresentationRouting();

  return useParams<TKey>();
}

export function Outlet() {
  const { Outlet: OutletComponent } = usePresentationRouting();

  return <OutletComponent />;
}
