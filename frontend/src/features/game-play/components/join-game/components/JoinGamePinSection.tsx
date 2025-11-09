import { ChangeEvent, KeyboardEvent, useId } from "react";
import { JOIN_GAME_PIN_LENGTH } from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGamePinSection", {
  slot1: "mb-8",
  slot2:
    "block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider",
  slot3:
    "w-full p-6 sm:p-8 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-4xl sm:text-6xl font-display tracking-[0.5em] focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 uppercase shadow-neon-accent",
  slot4: "flex justify-center items-center gap-3 mt-4",
  slot5: "font-mono text-xs text-light-500",
  slot6: "flex justify-center gap-3 mb-10 mt-6",
  pinStatusComplete:
    "font-display text-sm transition-colors text-success-500 animate-pulse",
  pinStatusPending: "font-display text-sm transition-colors text-primary-400",
  pinDotActive:
    "w-4 h-4 transition-all duration-300 transform bg-accent-500 shadow-neon-accent scale-125 rotate-45",
  pinDotInactive:
    "w-4 h-4 transition-all duration-300 transform bg-dark-400 border-2 border-primary-500/30",
});

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
  const pinInputId = useId();
  const pinLengthIndicatorId = useId();
  const pinCharacters = Array.from({ length: JOIN_GAME_PIN_LENGTH });
  const isComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;

  const handlePinChange = (event: ChangeEvent<HTMLInputElement>) => {
    onGamePinChange(event.target.value.toUpperCase());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isComplete) {
      onPinSubmit();
    }
  };

  return (
    <section {...styles.slot1}>
      <label htmlFor={pinInputId} {...styles.slot2}>
        ► Enter Game PIN ◄
      </label>
      <input
        id={pinInputId}
        type="text"
        value={gamePin}
        onChange={handlePinChange}
        onKeyDown={handleKeyDown}
        placeholder="••••••"
        {...styles.slot3}
        maxLength={JOIN_GAME_PIN_LENGTH}
        aria-describedby={pinLengthIndicatorId}
      />
      <div {...styles.slot4} id={pinLengthIndicatorId}>
        <span {...styles.slot5}>PIN LENGTH:</span>
        <span
          {...(isComplete ? styles.pinStatusComplete : styles.pinStatusPending)}
          aria-live="polite"
        >
          {gamePin.length}/{JOIN_GAME_PIN_LENGTH}
        </span>
      </div>

      <div {...styles.slot6}>
        {pinCharacters.map((_, index) => {
          const isActive = index < gamePin.length;

          return (
            <div
              key={index}
              {...(isActive ? styles.pinDotActive : styles.pinDotInactive)}
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
