import { FormEvent, ReactNode } from "react";

import { Button, Input } from "../../../../../shared/components";
import type { RegisterCredentials } from "../types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("RegisterForm", {
  slot1: "space-y-6",
  slot3: "flex items-center justify-center gap-2",
});

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
    <form onSubmit={handleSubmit} {...styles.slot1}>
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

      <Input
        type="password"
        name="password"
        placeholder={passwordPlaceholder}
        label={passwordLabel}
        icon={{ name: "Lock" }}
        required
      />

      <Button type="submit" variant="accent" size="lg" fullWidth>
        <span {...styles.slot3}>
          <span>{submitLabel}</span>
          {submitIcon ? <span>{submitIcon}</span> : null}
        </span>
      </Button>
    </form>
  );
}
