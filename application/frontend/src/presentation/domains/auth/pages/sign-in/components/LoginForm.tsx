import { FormEvent, ReactNode } from "react";

import {
  Input,
  PrimaryButton,
  PasswordInput,
} from "../../../../../../presentation/shared/ui/components";
import type { LoginCredentials } from "../types";

const FORM_CLASSES = "space-y-6";
const ACTION_CONTENT_CLASSES = "flex items-center justify-center gap-2";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void> | void;
  emailLabel: string;
  passwordLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  submitLabel: string;
  submitIcon?: ReactNode;
}

export function LoginForm({
  onSubmit,
  emailLabel,
  passwordLabel,
  emailPlaceholder,
  passwordPlaceholder,
  submitLabel,
  submitIcon,
}: LoginFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={FORM_CLASSES}>
      <Input
        type="email"
        name="email"
        placeholder={emailPlaceholder}
        label={emailLabel}
        icon={{ name: "UserRound" }}
        required
      />

      <PasswordInput
        name="password"
        placeholder={passwordPlaceholder}
        label={passwordLabel}
        required
      />

      <PrimaryButton type="submit" size="lg" fullWidth effect="retro">
        <span className={ACTION_CONTENT_CLASSES}>
          <span>{submitLabel}</span>
          {submitIcon ? <span>{submitIcon}</span> : null}
        </span>
      </PrimaryButton>
    </form>
  );
}
