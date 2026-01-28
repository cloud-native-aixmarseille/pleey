import { useEffect, useMemo, useState } from 'react';
import type { JoinGameScreenFacade } from '../../../../../../application/game-session/live/player/facades/join-game-screen.facade';
import { GameJoinErrorCode } from '../../../../../../domains/game-session/errors/game-join-error-code';

interface JoinGameFlowLike {
  truncatePin(pin: string): string;
  validatePin(pin: string): GameJoinErrorCode | null;
}

interface JoinRequestLike {
  readonly guestId?: string;
  readonly pin: string;
  readonly username?: string;
}

interface UseJoinGameScreenStateParams {
  readonly clearError: () => void;
  readonly flowService: JoinGameFlowLike;
  readonly guestNickname: string;
  readonly isAuthenticated: boolean;
  readonly joinGameScreenFacade: JoinGameScreenFacade;
  readonly joinAsAuthenticated: (input: {
    pin: string;
    userId: number;
    username: string;
  }) => Promise<void>;
  readonly joinAsGuest: (input: { pin: string; nickname: string }) => Promise<void>;
  readonly lastJoinRequest: JoinRequestLike | null;
  readonly navigate: (to: string) => void;
  readonly prefilledPin: string;
  readonly resolveLobbyRoute: (pin: string) => string;
  readonly translate: (key: string, values?: Record<string, string>) => string;
  readonly user: { id: number; username: string } | null;
}

export function useJoinGameScreenState({
  clearError,
  flowService,
  guestNickname,
  isAuthenticated,
  joinGameScreenFacade,
  joinAsAuthenticated,
  joinAsGuest,
  lastJoinRequest,
  navigate,
  prefilledPin,
  resolveLobbyRoute,
  translate,
  user,
}: UseJoinGameScreenStateParams) {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState(guestNickname);
  const [pinTouched, setPinTouched] = useState(false);
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [showGuestStep, setShowGuestStep] = useState(false);

  useEffect(() => {
    if (joinGameScreenFacade.shouldHydrateNickname(guestNickname, nickname)) {
      setNickname(guestNickname);
    }
  }, [guestNickname, joinGameScreenFacade, nickname]);

  useEffect(() => {
    if (joinGameScreenFacade.shouldHydratePin(prefilledPin, pin)) {
      setPin(prefilledPin);
    }
  }, [joinGameScreenFacade, pin, prefilledPin]);

  const normalizedPin = useMemo(() => flowService.truncatePin(pin), [flowService, pin]);
  const normalizedNickname = nickname.trim();
  const pinErrorCode = pinTouched ? flowService.validatePin(normalizedPin) : null;
  const nicknameErrorCode = joinGameScreenFacade.resolveNicknameErrorCode(
    nicknameTouched,
    normalizedNickname,
  );
  const requestMessage = joinGameScreenFacade.buildRequestMessage(lastJoinRequest, translate);

  async function handleContinue(): Promise<void> {
    setPinTouched(true);

    const outcome = await joinGameScreenFacade.continueJoin({
      clearError,
      flowService,
      normalizedPin,
      isAuthenticated,
      user,
      joinAsAuthenticated,
      resolveLobbyRoute,
    });

    if (outcome.type === 'navigate') {
      navigate(outcome.route);
      return;
    }

    if (outcome.type === 'show-guest-step') {
      setShowGuestStep(true);
    }
  }

  async function handleGuestJoin(): Promise<void> {
    setPinTouched(true);
    setNicknameTouched(true);

    const outcome = await joinGameScreenFacade.completeGuestJoin({
      clearError,
      flowService,
      normalizedPin,
      normalizedNickname,
      joinAsGuest,
      resolveLobbyRoute,
    });

    if (outcome.type === 'navigate') {
      navigate(outcome.route);
    }
  }

  return {
    currentStep: (showGuestStep ? 2 : 1) as 1 | 2 | 3,
    nickname,
    nicknameErrorCode,
    normalizedPin,
    pinErrorCode,
    requestMessage,
    setNicknameTouched,
    setPinTouched,
    showGuestStep,
    handleBackToPin: () => {
      clearError();
      setShowGuestStep(false);
    },
    handleNicknameChange: (value: string) => {
      clearError();
      setNickname(value);
    },
    handlePinChange: (value: string) => {
      clearError();
      setPin(flowService.truncatePin(value));
    },
    handlePrimaryAction: showGuestStep ? () => void handleGuestJoin() : () => void handleContinue(),
  };
}
