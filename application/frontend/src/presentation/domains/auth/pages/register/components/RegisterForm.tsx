import { FormEvent, ReactNode } from "react";

import {
  PrimaryButton,
  Input,
  PasswordInput,
} from "../../../../../../presentation/shared/ui/components";
import type { RegisterCredentials } from "../types";

const FORM_CLASSES = "space-y-6";
const ACTION_CONTENT_CLASSES = "flex items-center justify-center gap-2";
const AUTH_CTA_WRAPPER_CLASSES =
  "rounded-[var(--arcade-radius-lg)] border border-primary-500/20 bg-light-50/70 p-[2px] dark:bg-dark-700/40";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void> | void;
  usernameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  usernamePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  submitLabel: string;
  submitIcon?: ReactNode;
}

export function RegisterForm({
  onSubmit,
  usernameLabel,
  emailLabel,
  passwordLabel,
  usernamePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  submitLabel,
  submitIcon,
}: RegisterFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    await onSubmit({ username, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={FORM_CLASSES}>
      <Input
        type="text"
        name="username"
        placeholder={usernamePlaceholder}
        label={usernameLabel}
        icon={{ name: "UserRound" }}
        required
      />

      <Input
        type="email"
        name="email"
        placeholder={emailPlaceholder}
        label={emailLabel}
        icon={{ name: "Mail" }}
        required
      />

      <PasswordInput
        name="password"
        placeholder={passwordPlaceholder}
        label={passwordLabel}
        required
      />

      <div className={AUTH_CTA_WRAPPER_CLASSES}>
        <PrimaryButton type="submit" size="md" fullWidth effect="retro">
          <span className={ACTION_CONTENT_CLASSES}>
            <span>{submitLabel}</span>
            {submitIcon ? <span>{submitIcon}</span> : null}
          </span>
        </PrimaryButton>
      </div>
    </form>
  );
}
