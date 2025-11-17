import { ChangeEvent, KeyboardEvent, useId } from "react";
import { useTranslation } from "react-i18next";
import { JOIN_GAME_PIN_LENGTH } from "../constants";

const PIN_SECTION_WRAPPER_CLASSES = "mb-8";
const PIN_LABEL_CLASSES =
  "mb-4 block text-center font-display text-xs uppercase tracking-wider text-primary-300 sm:text-sm";
const PIN_INPUT_CLASSES =
  "w-full rounded-xl border-4 border-accent-500/50 bg-dark-500 p-6 text-center font-display text-4xl uppercase tracking-[0.5em] text-accent-400 shadow-neon-accent transition-all placeholder-dark-300 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/30 sm:p-8 sm:text-6xl";
const PIN_STATUS_WRAPPER_CLASSES =
  "mt-4 flex items-center justify-center gap-3";
const PIN_STATUS_LABEL_CLASSES = "font-mono text-xs text-light-500";
const PIN_STATUS_COMPLETE_CLASSES =
  "font-display text-sm text-success-500 transition-colors animate-pulse";
const PIN_STATUS_PENDING_CLASSES =
  "font-display text-sm text-primary-400 transition-colors";
const PIN_DOTS_WRAPPER_CLASSES = "mt-6 mb-10 flex justify-center gap-3";
const PIN_DOT_ACTIVE_CLASSES =
  "h-4 w-4 transform rotate-45 bg-accent-500 shadow-neon-accent transition-all duration-300 scale-125";
const PIN_DOT_INACTIVE_CLASSES =
  "h-4 w-4 transform border-2 border-primary-500/30 bg-dark-400 transition-all duration-300";

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
      <label htmlFor={pinInputId} className={PIN_LABEL_CLASSES}>
        {t("game.joinPage.pin.label")}
      </label>
      <input
        id={pinInputId}
        type="text"
        value={gamePin}
        onChange={handlePinChange}
        onKeyDown={handleKeyDown}
        placeholder={pinPlaceholder}
        className={PIN_INPUT_CLASSES}
        maxLength={JOIN_GAME_PIN_LENGTH}
        aria-describedby={pinLengthIndicatorId}
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
