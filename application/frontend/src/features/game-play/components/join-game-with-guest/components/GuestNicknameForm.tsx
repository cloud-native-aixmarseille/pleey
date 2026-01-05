import { ChangeEvent, KeyboardEvent, useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button, BackToButton } from "../../../../../shared/components";
import { GUEST_NICKNAME_MAX_LENGTH } from "../constants";

const NICKNAME_SECTION_CLASSES = "mb-8";
const NICKNAME_LABEL_CLASSES =
  "mb-4 block text-center font-display text-xs uppercase tracking-wider text-dark-400 dark:text-primary-300 sm:text-sm";
const NICKNAME_INPUT_CLASSES =
  "w-full rounded-xl border-4 border-accent-500/50 bg-light-50 p-4 text-center font-display text-2xl text-dark-500 shadow-neon-accent transition-all placeholder-dark-300 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/30 dark:bg-dark-500 dark:text-accent-400";
const NICKNAME_HELPER_CLASSES =
  "mt-2 text-center font-mono text-xs text-dark-300 dark:text-light-500";

const BUTTON_WRAPPER_CLASSES =
  "mb-4 transform transition-transform hover:scale-105 retro-shadow";
const BUTTON_CONTENT_CLASSES =
  "flex items-center justify-center gap-3 font-display text-base sm:text-lg";
const BUTTON_ICON_CLASSES = "animate-pulse";

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
  const { t } = useTranslation();
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
      <div className={NICKNAME_SECTION_CLASSES}>
        <label htmlFor={nicknameInputId} className={NICKNAME_LABEL_CLASSES}>
          {t("game.joinGuest.nicknameForm.label")}
        </label>
        <input
          id={nicknameInputId}
          type="text"
          ref={inputRef}
          value={nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("game.joinGuest.nicknameForm.placeholder")}
          className={NICKNAME_INPUT_CLASSES}
          maxLength={GUEST_NICKNAME_MAX_LENGTH}
        />
        <p className={NICKNAME_HELPER_CLASSES}>
          {t("game.joinGuest.nicknameForm.helper", {
            max: GUEST_NICKNAME_MAX_LENGTH,
          })}
        </p>
      </div>

      <div className={BUTTON_WRAPPER_CLASSES}>
        <Button
          variant="accent"
          size="xl"
          fullWidth
          effect="retro"
          alignment="center"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          <span className={BUTTON_CONTENT_CLASSES}>
            <span className={BUTTON_ICON_CLASSES}>►</span>
            <span>{t("game.joinGuest.nicknameForm.submit")}</span>
            <span className={BUTTON_ICON_CLASSES}>◄</span>
          </span>
        </Button>
      </div>

      <BackToButton
        label={t("game.joinGuest.nicknameForm.back")}
        onClick={onBack}
        variant="link"
        tone="primary"
        alignment="center"
        fullWidth
      />
    </>
  );
}
