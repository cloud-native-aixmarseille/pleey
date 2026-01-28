import type { ServiceIdentifier } from 'inversify';
import { createContext, createElement, type PropsWithChildren, useContext, useRef } from 'react';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

type RuntimeDependencyResolver = <T>(serviceIdentifier: ServiceIdentifier<T>) => T;

const RuntimeDependencyContext = createContext<RuntimeDependencyResolver | null>(null);

interface RuntimeDependencyProviderProps extends PropsWithChildren {
  readonly value: RuntimeDependencyResolver;
}

export function RuntimeDependencyProvider({ children, value }: RuntimeDependencyProviderProps) {
  return createElement(RuntimeDependencyContext.Provider, { value }, children);
}

export function useRuntimeDependency<T>(serviceIdentifier: ServiceIdentifier<T>): T {
  const resolveRuntimeDependency = useContext(RuntimeDependencyContext);
  const dependencyRef = useRef<T | null>(null);

  if (!resolveRuntimeDependency) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED);
  }

  if (dependencyRef.current === null) {
    dependencyRef.current = resolveRuntimeDependency(serviceIdentifier);
  }

  return dependencyRef.current;
}
