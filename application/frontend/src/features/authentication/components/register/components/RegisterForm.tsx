import { FormEvent, ReactNode } from "react";

import {
  Button,
  Input,
  PasswordInput,
  type PasswordToggleLabels,
} from "../../../../../shared/components";
import type { RegisterCredentials } from "../types";

const FORM_CLASSES = "space-y-6";
const ACTION_CONTENT_CLASSES = "flex items-center justify-center gap-2";

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
  passwordToggleLabels: PasswordToggleLabels;
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
  passwordToggleLabels,
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
        toggleLabels={passwordToggleLabels}
        required
      />

      <Button type="submit" variant="accent" size="lg" fullWidth>
        <span className={ACTION_CONTENT_CLASSES}>
          <span>{submitLabel}</span>
          {submitIcon ? <span>{submitIcon}</span> : null}
        </span>
      </Button>
    </form>
  );
}
