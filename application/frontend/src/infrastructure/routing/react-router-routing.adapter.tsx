import type { ComponentType, MouseEventHandler } from 'react';
import React from 'react';
import {
  Navigate as ReactRouterNavigate,
  Outlet as ReactRouterOutlet,
  useHref,
  useLinkClickHandler,
  useNavigate as useReactRouterNavigate,
  useParams as useReactRouterParams,
} from 'react-router-dom';
import type {
  CreateLinkFn,
  PresentationParams,
  RoutingPort,
} from '../../application/shared/contracts/routing.port';

const createLink: CreateLinkFn = <TProps extends object>(
  component: ComponentType<TProps>,
): ComponentType<{ to: string } & Omit<TProps, 'href'>> => {
  function CreatedLink({ to, ...rest }: { to: string } & Omit<TProps, 'href'>) {
    const href = useHref(to);
    const handleNavClick = useLinkClickHandler(to);
    const userOnClick = (rest as { onClick?: MouseEventHandler<HTMLAnchorElement> }).onClick;

    const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
      userOnClick?.(e);
      handleNavClick(e);
    };

    return React.createElement(component, { ...rest, href, onClick } as unknown as TProps);
  }

  return CreatedLink;
};

export class ReactRouterRoutingAdapter {
  createPort(): RoutingPort {
    const useParams = <TKey extends string = string>(): PresentationParams<TKey> =>
      useReactRouterParams<TKey>() as PresentationParams<TKey>;

    return {
      createLink,
      Navigate: ReactRouterNavigate,
      Outlet: ReactRouterOutlet,
      useNavigate: useReactRouterNavigate,
      useParams,
    };
  }
}
