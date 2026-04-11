import type { ComponentType, ReactNode } from 'react';

export const ROUTE_FACTORY = Symbol.for('routeFactory');

interface PresentationNavigateProps {
  readonly to: string;
  readonly replace?: boolean;
}

export type CreateLinkFn = <TProps extends object>(
  component: ComponentType<TProps>,
) => ComponentType<{ to: string } & Omit<TProps, 'href'>>;

export type PresentationNavigate = (to: string) => void;

export type PresentationParams<TKey extends string = string> = Readonly<
  Partial<Record<TKey, string>>
>;

export interface RoutingPort {
  readonly createLink: CreateLinkFn;
  readonly Navigate: ComponentType<PresentationNavigateProps>;
  readonly Outlet: ComponentType;
  readonly useNavigate: () => PresentationNavigate;
  readonly useParams: <TKey extends string = string>() => PresentationParams<TKey>;
}

export interface PresentationRouteObject {
  readonly path?: string;
  readonly index?: boolean;
  readonly element?: ReactNode;
  readonly children?: readonly PresentationRouteObject[];
}

export interface RouteFactory {
  create(): PresentationRouteObject[];
}
