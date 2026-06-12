import type { Container, ServiceIdentifier } from 'inversify';
import type { ReactNode } from 'react';

export interface AppProviderFactory {
  readonly order: number;
  wrap(children: ReactNode): ReactNode;
}

export const AppProviderFactoryToken: ServiceIdentifier<AppProviderFactory> =
  Symbol('AppProviderFactory');

export abstract class BaseAppProviderFactory implements AppProviderFactory {
  abstract readonly order: number;

  wrap(children: ReactNode): ReactNode {
    return this.create(children);
  }

  protected abstract create(children: ReactNode): ReactNode;
}

export enum AppProviderOrder {
  UI = 100,
  TRANSLATION = 200,
  ROUTING = 300,
  FORM = 400,
  KEYBOARD = 450,
  AUTH = 500,
  PATIENCE = 600,
  WORKSPACE = 700,
  PARTY = 800,
}

export function createAppProviderFactories(container: Container): readonly AppProviderFactory[] {
  return [...container.getAll(AppProviderFactoryToken)].sort(
    (left: AppProviderFactory, right: AppProviderFactory) => left.order - right.order,
  );
}

export function composeAppProviders(
  children: ReactNode,
  providerFactories: readonly AppProviderFactory[],
): ReactNode {
  return providerFactories.reduceRight((currentChildren, providerFactory) => {
    return providerFactory.wrap(currentChildren);
  }, children);
}
