import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  Input,
  PrimaryButton,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";
import type { User } from "../../../../../../domains/auth/types";

const FORM_WRAPPER_CLASSES = "flex flex-col gap-6";
const FORM_FIELDS_GRID_CLASSES = "grid grid-cols-1 gap-6";
const ACTION_ROW_CLASSES =
  "flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center";
const PRIMARY_BUTTON_WRAPPER_CLASSES = "sm:w-auto";

interface ProfileFormProps {
  user: User;
  emailPlaceholder: string;
  usernameLabel: string;
  emailLabel: string;
  saveLabel: string;
  cancelLabel: string;
  loadingLabel: string;
  onSubmit: (updates: { username: string; email: string }) => Promise<void>;
  onReset?: () => void;
  isSaving: boolean;
}

export function ProfileForm({
  user,
  emailPlaceholder,
  usernameLabel,
  emailLabel,
  saveLabel,
  cancelLabel,
  loadingLabel,
  onSubmit,
  onReset,
  isSaving,
}: ProfileFormProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUsername(user.username);
    setEmail(user.email);
  }, [user.email, user.username]);

  const isDirty = useMemo(() => {
    return username !== user.username || email !== user.email;
  }, [email, user.email, user.username, username]);

  const disableSave = isSaving || isSubmitting || !isDirty;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ username: username.trim(), email: email.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUsername(user.username);
    setEmail(user.email);
    onReset?.();
  };

  return (
    <form className={FORM_WRAPPER_CLASSES} onSubmit={handleSubmit}>
      <div className={FORM_FIELDS_GRID_CLASSES}>
        <Input
          label={usernameLabel}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={usernameLabel}
          required
          minLength={3}
          maxLength={32}
        />

        <Input
          label={emailLabel}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={emailPlaceholder}
          required
        />
      </div>

      <div className={ACTION_ROW_CLASSES}>
        <div className={PRIMARY_BUTTON_WRAPPER_CLASSES}>
          <PrimaryButton type="submit" disabled={disableSave} fullWidth>
            {disableSave ? loadingLabel : saveLabel}
          </PrimaryButton>
        </div>
        <SecondaryButton
          type="button"
          effect="flat"
          onClick={handleReset}
          disabled={!isDirty || isSaving || isSubmitting}
          fullWidth
        >
          {cancelLabel}
        </SecondaryButton>
      </div>
    </form>
  );
}
