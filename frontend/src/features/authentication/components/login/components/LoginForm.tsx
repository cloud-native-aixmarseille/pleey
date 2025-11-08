import { FormEvent, ReactNode } from "react";

import { Input, PrimaryButton } from "../../../../../shared/components";
import type { LoginCredentials } from "../types";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        name="email"
        placeholder={emailPlaceholder}
        label={emailLabel}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        }
        required
      />

      <Input
        type="password"
        name="password"
        placeholder={passwordPlaceholder}
        label={passwordLabel}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
        required
      />

      <PrimaryButton type="submit" size="lg" fullWidth>
        <span className="flex items-center justify-center gap-2">
          <span>{submitLabel}</span>
          {submitIcon ? <span>{submitIcon}</span> : null}
        </span>
      </PrimaryButton>
    </form>
  );
}
