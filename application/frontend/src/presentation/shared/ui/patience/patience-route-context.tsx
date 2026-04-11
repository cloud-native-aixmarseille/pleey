import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useUserIdle } from './hooks/use-user-idle';

const DEFAULT_PATIENCE_IDLE_AFTER_MS = 10_000;

interface PatienceRouteState {
  readonly enabled: boolean;
  readonly active: boolean;
}

interface PatienceRouteContextValue extends PatienceRouteState {
  registerRoute(routeId: symbol): void;
  unregisterRoute(routeId: symbol): void;
  updateRouteActivity(routeId: symbol, active: boolean): void;
}

const defaultPatienceRouteState: PatienceRouteState = {
  enabled: false,
  active: false,
};

const defaultPatienceRouteContextValue: PatienceRouteContextValue = {
  ...defaultPatienceRouteState,
  registerRoute: () => undefined,
  unregisterRoute: () => undefined,
  updateRouteActivity: () => undefined,
};

const PatienceRouteStateContext = createContext<PatienceRouteContextValue>(
  defaultPatienceRouteContextValue,
);

export function PatienceRouteStateProvider({ children }: PropsWithChildren) {
  const [routes, setRoutes] = useState<readonly [symbol, boolean][]>([]);

  const registerRoute = useCallback((routeId: symbol) => {
    setRoutes((currentRoutes) => {
      const nextRoutes = currentRoutes.filter(([currentRouteId]) => currentRouteId !== routeId);

      return [...nextRoutes, [routeId, false]];
    });
  }, []);

  const updateRouteActivity = useCallback((routeId: symbol, active: boolean) => {
    setRoutes((currentRoutes) =>
      currentRoutes.map(([currentRouteId, currentActive]) =>
        currentRouteId === routeId ? [currentRouteId, active] : [currentRouteId, currentActive],
      ),
    );
  }, []);

  const unregisterRoute = useCallback((routeId: symbol) => {
    setRoutes((currentRoutes) =>
      currentRoutes.filter(([currentRouteId]) => currentRouteId !== routeId),
    );
  }, []);

  const currentRoute = routes.at(-1);

  const contextValue = useMemo(
    () => ({
      enabled: currentRoute !== undefined,
      active: currentRoute?.[1] ?? false,
      registerRoute,
      unregisterRoute,
      updateRouteActivity,
    }),
    [currentRoute, registerRoute, unregisterRoute, updateRouteActivity],
  );

  return (
    <PatienceRouteStateContext.Provider value={contextValue}>
      {children}
    </PatienceRouteStateContext.Provider>
  );
}

export function usePatienceRouteState(): PatienceRouteContextValue {
  return useContext(PatienceRouteStateContext);
}

interface PatienceRouteProviderProps extends PropsWithChildren {
  readonly idleAfterMs?: number;
}

export function PatienceRouteProvider({ children, idleAfterMs }: PatienceRouteProviderProps) {
  const { registerRoute, unregisterRoute, updateRouteActivity } = usePatienceRouteState();
  const routeIdRef = useRef(Symbol('patience-route'));
  const resolvedIdleAfterMs = idleAfterMs ?? DEFAULT_PATIENCE_IDLE_AFTER_MS;
  const isIdle = useUserIdle(true, resolvedIdleAfterMs);

  useLayoutEffect(() => {
    registerRoute(routeIdRef.current);

    return () => {
      unregisterRoute(routeIdRef.current);
    };
  }, [registerRoute, unregisterRoute]);

  useLayoutEffect(() => {
    updateRouteActivity(routeIdRef.current, isIdle);

    return () => {
      updateRouteActivity(routeIdRef.current, false);
    };
  }, [isIdle, updateRouteActivity]);

  return children;
}
