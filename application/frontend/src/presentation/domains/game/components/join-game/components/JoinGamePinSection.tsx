import { ChangeEvent, KeyboardEvent, useId } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../../../../presentation/shared/ui/components";
import { JOIN_GAME_PIN_LENGTH } from "../constants";

const PIN_SECTION_WRAPPER_CLASSES = "mb-8";
const PIN_STATUS_WRAPPER_CLASSES =
  "mt-4 flex items-center justify-center gap-3";
const PIN_STATUS_LABEL_CLASSES =
  "font-mono text-xs text-dark-300 dark:text-light-500";
const PIN_STATUS_COMPLETE_CLASSES =
  "font-display text-sm text-success-500 transition-colors animate-pulse";
const PIN_STATUS_PENDING_CLASSES =
  "font-display text-sm text-primary-400 transition-colors";
const PIN_DOTS_WRAPPER_CLASSES = "mt-6 mb-10 flex justify-center gap-3";
const PIN_DOT_ACTIVE_CLASSES =
  "h-4 w-4 transform rotate-45 bg-accent-500 shadow-neon-accent transition-all duration-300 scale-125";
const PIN_DOT_INACTIVE_CLASSES =
  "h-4 w-4 transform border-2 border-primary-500/30 bg-light-200 transition-all duration-300 dark:bg-dark-400";

interface JoinGamePinSectionProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onPinSubmit: () => void;
}

export function JoinGamePinSection({
  gamePin,
  onGamePinChange,
  onPinSubmit,
}: JoinGamePinSectionProps) {
  const { t } = useTranslation();
  const pinInputId = useId();
  const pinLengthIndicatorId = useId();
  const pinCharacters = Array.from({ length: JOIN_GAME_PIN_LENGTH });
  const isComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;
  const pinPlaceholder = t("game.joinPage.pin.placeholder", {
    defaultValue: "••••••",
  });

  const handlePinChange = (event: ChangeEvent<HTMLInputElement>) => {
    onGamePinChange(event.target.value.toUpperCase());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isComplete) {
      onPinSubmit();
    }
  };

  return (
    <section className={PIN_SECTION_WRAPPER_CLASSES}>
      <Input
        id={pinInputId}
        type="text"
        value={gamePin}
        onChange={handlePinChange}
        onKeyDown={handleKeyDown}
        placeholder={pinPlaceholder}
        maxLength={JOIN_GAME_PIN_LENGTH}
        aria-describedby={pinLengthIndicatorId}
        label={t("game.joinPage.pin.label")}
        tone="dark"
      />
      <div className={PIN_STATUS_WRAPPER_CLASSES} id={pinLengthIndicatorId}>
        <span className={PIN_STATUS_LABEL_CLASSES}>
          {t("game.joinPage.pin.lengthLabel")}
        </span>
        <span
          className={
            isComplete
              ? PIN_STATUS_COMPLETE_CLASSES
              : PIN_STATUS_PENDING_CLASSES
          }
          aria-live="polite"
        >
          {t("game.joinPage.pin.lengthValue", {
            current: gamePin.length,
            total: JOIN_GAME_PIN_LENGTH,
          })}
        </span>
      </div>

      <div className={PIN_DOTS_WRAPPER_CLASSES}>
        {pinCharacters.map((_, index) => {
          const isActive = index < gamePin.length;

          return (
            <div
              key={index}
              className={
                isActive ? PIN_DOT_ACTIVE_CLASSES : PIN_DOT_INACTIVE_CLASSES
              }
              style={{
                animationDelay: `${index * 0.05}s`,
                animation: isActive ? "pixelPop 0.3s ease-out" : "none",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
