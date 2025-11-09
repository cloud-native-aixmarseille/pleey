import { FormEvent, ReactNode } from "react";

import { Input, PrimaryButton } from "../../../../../shared/components";
import type { LoginCredentials } from "../types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LoginForm", {
  slot1: "space-y-6",
  slot3: "flex items-center justify-center gap-2",
});

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
    <form onSubmit={handleSubmit} {...styles.slot1}>
      <Input
        type="email"
        name="email"
        placeholder={emailPlaceholder}
        label={emailLabel}
        icon={{ name: "UserRound" }}
        required
      />

      <Input
        type="password"
        name="password"
        placeholder={passwordPlaceholder}
        label={passwordLabel}
        icon={{ name: "Lock" }}
        required
      />

      <PrimaryButton type="submit" size="lg" fullWidth>
        <span {...styles.slot3}>
          <span>{submitLabel}</span>
          {submitIcon ? <span>{submitIcon}</span> : null}
        </span>
      </PrimaryButton>
    </form>
  );
}
