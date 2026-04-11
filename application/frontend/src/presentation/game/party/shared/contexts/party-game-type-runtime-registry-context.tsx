import {
  createContext,
  createElement,
  type PropsWithChildren,
  type ReactElement,
  useContext,
} from 'react';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { type GameType } from '../../../../../domains/game/types/shared/game-type';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

interface PartyGameTypeHostRuntimePanelProps {
  readonly party: PartyObservation;
}

interface PartyGameTypePlayerResultSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

interface PartyGameTypePlayerStageSurfaceProps extends PartyGameTypePlayerResultSurfaceProps {
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

export interface PartyGameTypeRuntimeView {
  renderHostResultPanel(props: PartyGameTypeHostRuntimePanelProps): ReactElement | null;
  renderHostStagePanel(props: PartyGameTypeHostRuntimePanelProps): ReactElement | null;
  renderPlayerResultSurface(props: PartyGameTypePlayerResultSurfaceProps): ReactElement | null;
  renderPlayerStageSurface(props: PartyGameTypePlayerStageSurfaceProps): ReactElement | null;
}

export interface PartyGameTypeRuntimeRegistry {
  resolve(gameType: GameType): PartyGameTypeRuntimeView | null;
}

const PartyGameTypeRuntimeRegistryContext = createContext<PartyGameTypeRuntimeRegistry | null>(
  null,
);

interface PartyGameTypeRuntimeRegistryProviderProps extends PropsWithChildren {
  readonly value: PartyGameTypeRuntimeRegistry;
}

export function PartyGameTypeRuntimeRegistryProvider({
  children,
  value,
}: PartyGameTypeRuntimeRegistryProviderProps): ReactElement {
  return createElement(PartyGameTypeRuntimeRegistryContext.Provider, { value }, children);
}

export function usePartyGameTypeRuntimeRegistry(): PartyGameTypeRuntimeRegistry {
  const value = useContext(PartyGameTypeRuntimeRegistryContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED);
  }

  return value;
}
