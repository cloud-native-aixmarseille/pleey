import { ChangeEvent, KeyboardEvent, useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  BackToButton,
  Input,
  PrimaryButton,
} from "../../../../../../presentation/shared/ui/components";
import { GUEST_NICKNAME_MAX_LENGTH } from "../constants";

const NICKNAME_SECTION_CLASSES = "mb-8";

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
        <Input
          id={nicknameInputId}
          type="text"
          ref={inputRef}
          value={nickname}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("game.joinGuest.nicknameForm.placeholder")}
          maxLength={GUEST_NICKNAME_MAX_LENGTH}
          label={t("game.joinGuest.nicknameForm.label")}
          hint={t("game.joinGuest.nicknameForm.helper", {
            max: GUEST_NICKNAME_MAX_LENGTH,
          })}
          tone="dark"
        />
      </div>

      <div className="mb-4">
        <PrimaryButton
          size="xl"
          fullWidth
          effect="retro"
          alignment="center"
          onClick={onSubmit}
          disabled={isDisabled}
          icon={{ name: "ArrowRight" }}
        >
          {t("game.joinGuest.nicknameForm.submit")}
        </PrimaryButton>
      </div>

      <BackToButton
        label={t("game.joinGuest.nicknameForm.back")}
        onClick={onBack}
        alignment="center"
        fullWidth
      />
    </>
  );
}
