import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, Container } from "../../../../shared/components";

import { RegisterLayout } from "./components/RegisterLayout";
import { RegisterHeader } from "./components/RegisterHeader";
import { RegisterForm } from "./components/RegisterForm";
import { LoginPrompt } from "./components/LoginPrompt";
import type { RegisterCredentials } from "./types";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("RegisterPage", {
  slot1: "animate-slide-up",
  slot2: "p-8 sm:p-10",
});


interface RegisterPageProps {
  onRegister: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async ({ username, email, password }: RegisterCredentials) => {
      await onRegister(username, email, password);
    },
    [onRegister]
  );

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleLoginNavigation = useCallback(() => {
    navigate("/auth/login");
  }, [navigate]);

  return (
    <RegisterLayout>
      <Container size="sm">
        <div {...styles.slot1}>
          <RegisterHeader
            title={t("auth.registerTitle")}
            subtitle={t("auth.registerSubtitle")}
            backLabel={t("auth.back")}
            onBack={handleBack}
          />

          <Card {...styles.slot2}>
            <RegisterForm
              onSubmit={handleSubmit}
              usernameLabel={t("auth.username")}
              emailLabel={t("auth.email")}
              passwordLabel={t("auth.password")}
              usernamePlaceholder={t("auth.usernamePlaceholder")}
              emailPlaceholder={t("auth.emailPlaceholder")}
              passwordPlaceholder={t("auth.passwordPlaceholder")}
              submitLabel={t("auth.registerButton")}
              submitIcon="✨"
            />

            <LoginPrompt
              message={t("auth.alreadyHaveAccount")}
              ctaLabel={t("auth.signIn")}
              onCtaClick={handleLoginNavigation}
              ctaIcon="→"
            />
          </Card>
        </div>
      </Container>
    </RegisterLayout>
  );
}
