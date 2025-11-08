import { ChangeEvent, KeyboardEvent, useId } from "react";
import { Button, BackToButton } from "../../../../../shared/components";
import { GUEST_NICKNAME_MAX_LENGTH } from "../constants";

interface GuestNicknameFormProps {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  autoFocus?: boolean;
}

export function GuestNicknameForm({
  nickname,
  onNicknameChange,
  onSubmit,
  onBack,
  autoFocus = true,
}: GuestNicknameFormProps) {
  const nicknameInputId = useId();
  const trimmedNickname = nickname.trim();
  const isDisabled = trimmedNickname.length === 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onNicknameChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isDisabled) {
      onSubmit();
    }
  };

  return (
    <>
      <div className="mb-8">
        <label
          htmlFor={nicknameInputId}
          className="block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider"
        >
          ► Choose Your Nickname ◄
        </label>
        <input
          id={nicknameInputId}
          type="text"
          value={nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter nickname..."
          className="w-full p-4 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-2xl font-display focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 shadow-neon-accent"
          maxLength={GUEST_NICKNAME_MAX_LENGTH}
          autoFocus={autoFocus}
        />
        <p className="text-center font-mono text-xs text-light-500 mt-2">
          Max {GUEST_NICKNAME_MAX_LENGTH} characters
        </p>
      </div>

      <Button
        variant="accent"
        size="xl"
        fullWidth
        onClick={onSubmit}
        disabled={isDisabled}
        className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all mb-4"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="animate-pulse">►</span>
          <span>JOIN AS GUEST</span>
          <span className="animate-pulse">◄</span>
        </span>
      </Button>

      <BackToButton
        label="Back to PIN entry"
        onClick={onBack}
        variant="link"
        tone="primary"
        alignment="center"
        fullWidth
      />
    </>
  );
}
