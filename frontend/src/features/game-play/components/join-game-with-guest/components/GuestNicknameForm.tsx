import { ChangeEvent, KeyboardEvent, useEffect, useId, useRef } from "react";
import { Button, BackToButton } from "../../../../../shared/components";
import { GUEST_NICKNAME_MAX_LENGTH } from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("GuestNicknameForm", {
  slot1: "mb-8",
  slot2:
    "block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider",
  slot3:
    "w-full p-4 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-2xl font-display focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 shadow-neon-accent",
  slot4: "text-center font-mono text-xs text-light-500 mt-2",
  slot5:
    "retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all mb-4",
  slot6: "flex items-center justify-center gap-3",
  slot7: "animate-pulse",
});

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus]);

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
      <div {...styles.slot1}>
        <label htmlFor={nicknameInputId} {...styles.slot2}>
          ► Choose Your Nickname ◄
        </label>
        <input
          id={nicknameInputId}
          type="text"
          ref={inputRef}
          value={nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter nickname..."
          {...styles.slot3}
          maxLength={GUEST_NICKNAME_MAX_LENGTH}
        />
        <p {...styles.slot4}>Max {GUEST_NICKNAME_MAX_LENGTH} characters</p>
      </div>

      <Button
        variant="accent"
        size="xl"
        fullWidth
        onClick={onSubmit}
        disabled={isDisabled}
        {...styles.slot5}
      >
        <span {...styles.slot6}>
          <span {...styles.slot7}>►</span>
          <span>JOIN AS GUEST</span>
          <span {...styles.slot7}>◄</span>
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
