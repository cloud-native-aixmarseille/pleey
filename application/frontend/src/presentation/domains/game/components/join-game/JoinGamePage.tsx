import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SecondaryButton } from "../../../../../presentation/shared/ui/components";

import { JoinGameLayout } from "./components/JoinGameLayout";
import { JoinGameHeader } from "./components/JoinGameHeader";
import { JoinGameContentCard } from "./components/JoinGameContentCard";
import { JoinGameSystemStatus } from "./components/JoinGameSystemStatus";
import { JoinGamePinSection } from "./components/JoinGamePinSection";
import { JoinGamePrimaryAction } from "./components/JoinGamePrimaryAction";
import { JoinGameInstructions } from "./components/JoinGameInstructions";
import { JoinGameFooterMessage } from "./components/JoinGameFooterMessage";
import { GuestNicknameForm } from "./components/GuestNicknameForm";
import { JOIN_GAME_PIN_LENGTH } from "./constants";

const SIGN_IN_SECTION_CLASSES = "mt-10 text-center";
const SIGN_IN_PROMPT_CLASSES =
  "mb-2 font-mono text-4xl text-dark-400 dark:text-light-400";

interface JoinGamePageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
  onJoinAsGuest: (nickname: string) => void;
  isAuthenticated: boolean;
  username?: string;
}

export default function JoinGamePage({
  gamePin,
  onGamePinChange,
  onJoinGame,
  onJoinAsGuest,
  isAuthenticated,
  username,
}: JoinGamePageProps) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const { t } = useTranslation();

  const getStringOrUndefined = (
    key: string,
    options?: Record<string, unknown>
  ) => {
    const value = t(key, options);
    return typeof value === "string" && value !== key ? value : undefined;
  };

  const isPinComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;
  const trimmedNickname = nickname.trim();

  const handleNavigateHome = () => navigate("/");
  const handleSignIn = () => navigate("/auth/login");

  const handlePinSubmit = () => {
    if (!isPinComplete) {
      return;
    }

    if (isAuthenticated) {
      onJoinGame();
      return;
    }

    setShowGuestForm(true);
  };

  const handleGuestSubmit = () => {
    if (trimmedNickname.length === 0) {
      return;
    }

    onJoinAsGuest(trimmedNickname);
  };

  const handleBackToPinEntry = () => setShowGuestForm(false);

  const displayName = username ?? t("game.joinGuest.status.anonymous");
  const subtitle = showGuestForm
    ? t("game.joinGuest.header.subtitleGuest")
    : t("game.joinGuest.header.subtitlePin");

  const statusMessage = isAuthenticated
    ? t("game.joinGuest.status.authenticated", { username: displayName })
    : showGuestForm
    ? t("game.joinGuest.status.guestMode")
    : undefined;

  const instructionsItemsKey = isAuthenticated
    ? "game.joinGuest.instructions.authenticated"
    : showGuestForm
    ? "game.joinGuest.instructions.guestMode"
    : "game.joinGuest.instructions.default";
  const instructionsItemsRaw = t(instructionsItemsKey, {
    returnObjects: true,
  });
  const instructionsItems = Array.isArray(instructionsItemsRaw)
    ? instructionsItemsRaw
    : undefined;
  const instructionsTitleKey = isAuthenticated
    ? "game.joinGuest.instructions.title.authenticated"
    : showGuestForm
    ? "game.joinGuest.instructions.title.guestMode"
    : "game.joinGuest.instructions.title.default";
  const instructionsTitle = getStringOrUndefined(instructionsTitleKey);

  const primaryButtonLabel = getStringOrUndefined(
    isAuthenticated
      ? "game.joinGuest.primaryButton.authenticated"
      : "game.joinGuest.primaryButton.continue"
  );
  const completeMessage = getStringOrUndefined(
    isAuthenticated
      ? "game.joinGuest.primaryButton.completeAuthenticated"
      : "game.joinGuest.primaryButton.completeContinue"
  );
  const signInPrompt = getStringOrUndefined("game.joinGuest.signIn.prompt");
  const signInCta = getStringOrUndefined("game.joinGuest.signIn.cta");

  return (
    <JoinGameLayout>
      <JoinGameHeader onNavigateHome={handleNavigateHome} subtitle={subtitle} />

      <JoinGameContentCard>
        <JoinGameSystemStatus statusMessage={statusMessage} />

        {!showGuestForm ? (
          <>
            <JoinGamePinSection
              gamePin={gamePin}
              onGamePinChange={onGamePinChange}
              onPinSubmit={handlePinSubmit}
            />

            <JoinGamePrimaryAction
              gamePin={gamePin}
              onSubmit={handlePinSubmit}
              buttonLabel={primaryButtonLabel}
              completeMessage={completeMessage}
            />

            {!isAuthenticated && signInPrompt && signInCta ? (
              <div className={SIGN_IN_SECTION_CLASSES}>
                <p className={SIGN_IN_PROMPT_CLASSES}>{signInPrompt}</p>
                <SecondaryButton
                  type="button"
                  onClick={handleSignIn}
                  effect="flat"
                  size="xl"
                >
                  {signInCta}
                </SecondaryButton>
              </div>
            ) : null}
          </>
        ) : (
          <GuestNicknameForm
            nickname={nickname}
            onNicknameChange={setNickname}
            onSubmit={handleGuestSubmit}
            onBack={handleBackToPinEntry}
          />
        )}

        <JoinGameInstructions
          title={instructionsTitle}
          items={instructionsItems}
        />
      </JoinGameContentCard>

      <JoinGameFooterMessage />
    </JoinGameLayout>
  );
}
