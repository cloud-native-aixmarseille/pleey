import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button, Input, PrimaryButton } from "../../../../../shared/components";
import type { User } from "../../../../../shared/types";

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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <PrimaryButton
          type="submit"
          disabled={disableSave}
          className="sm:w-auto"
        >
          {disableSave ? loadingLabel : saveLabel}
        </PrimaryButton>
        <Button
          type="button"
          variant="ghost"
          onClick={handleReset}
          disabled={!isDirty || isSaving || isSubmitting}
          className="text-light-600 hover:text-light-800"
        >
          {cancelLabel}
        </Button>
      </div>
    </form>
  );
}
