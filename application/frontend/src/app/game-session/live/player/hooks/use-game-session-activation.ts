import { useCallback, useRef, useState } from 'react';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import { runtimeContainer } from '../../../../composition/runtime-container';

interface UseGameSessionActivationOptions {
  readonly onSessionChange: () => void;
  readonly onSessionActivated: (normalizedPin: string) => void;
  readonly currentSessionNeedsReset?: boolean;
}

export function useGameSessionActivation(options: UseGameSessionActivationOptions) {
  const { currentSessionNeedsReset = false, onSessionActivated, onSessionChange } = options;
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const joinGameFlowServiceRef = useRef<JoinGameFlowService | null>(null);

  if (!joinGameFlowServiceRef.current) {
    joinGameFlowServiceRef.current = runtimeContainer.get(JoinGameFlowService);
  }

  const activateSession = useCallback(
    (pin: string) => {
      const normalizedPin = joinGameFlowServiceRef.current?.normalizePin(pin);
      if (!normalizedPin) {
        return;
      }

      if (sessionPin !== normalizedPin || currentSessionNeedsReset) {
        onSessionChange();
      }

      setSessionPin(normalizedPin);
      onSessionActivated(normalizedPin);
    },
    [currentSessionNeedsReset, onSessionActivated, onSessionChange, sessionPin],
  );

  return {
    sessionPin,
    activateSession,
  };
}
