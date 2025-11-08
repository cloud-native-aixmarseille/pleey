import { ChangeEvent, KeyboardEvent, useId } from "react";
import { JOIN_GAME_PIN_LENGTH } from "../constants";

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
    <section className="mb-8">
      <label
        htmlFor={pinInputId}
        className="block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider"
      >
        ► Enter Game PIN ◄
      </label>
      <input
        id={pinInputId}
        type="text"
        value={gamePin}
        onChange={handlePinChange}
        onKeyDown={handleKeyDown}
        placeholder="••••••"
        className="w-full p-6 sm:p-8 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-4xl sm:text-6xl font-display tracking-[0.5em] focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 uppercase shadow-neon-accent"
        maxLength={JOIN_GAME_PIN_LENGTH}
        aria-describedby={pinLengthIndicatorId}
      />
      <div
        className="flex justify-center items-center gap-3 mt-4"
        id={pinLengthIndicatorId}
      >
        <span className="font-mono text-xs text-light-500">PIN LENGTH:</span>
        <span
          className={`font-display text-sm transition-colors ${
            isComplete ? "text-success-500 animate-pulse" : "text-primary-400"
          }`}
          aria-live="polite"
        >
          {gamePin.length}/{JOIN_GAME_PIN_LENGTH}
        </span>
      </div>

      <div className="flex justify-center gap-3 mb-10 mt-6">
        {pinCharacters.map((_, index) => {
          const isActive = index < gamePin.length;

          return (
            <div
              key={index}
              className={`
                w-4 h-4 transition-all duration-300 transform
                ${
                  isActive
                    ? "bg-accent-500 shadow-neon-accent scale-125 rotate-45"
                    : "bg-dark-400 border-2 border-primary-500/30"
                }
              `}
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
