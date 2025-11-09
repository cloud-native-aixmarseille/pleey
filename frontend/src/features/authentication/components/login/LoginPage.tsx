import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, Container } from "../../../../shared/components";
import { useNotifications } from "../../../../application/app/hooks/useNotifications";

import { LoginLayout } from "./components/LoginLayout";
import { LoginHeader } from "./components/LoginHeader";
import { LoginForm } from "./components/LoginForm";
import { RegisterPrompt } from "./components/RegisterPrompt";
import type { LoginCredentials } from "./types";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("LoginPage", {
  slot1: "animate-slide-up",
  slot2: "p-8 sm:p-10",
});


interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notifyFromError } = useNotifications();

  const handleSubmit = useCallback(
    async ({ email, password }: LoginCredentials) => {
      try {
        await onLogin(email, password);
      } catch (error) {
        notifyFromError(error, "auth.errors.invalidCredentials");
      }
    },
    [notifyFromError, onLogin]
  );

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleRegisterNavigation = useCallback(() => {
    navigate("/auth/register");
  }, [navigate]);

  return (
    <LoginLayout>
      <Container size="sm">
        <div {...styles.slot1}>
          <LoginHeader
            title={t("auth.loginTitle")}
            subtitle={t("auth.loginSubtitle")}
            backLabel={t("auth.back")}
            onBack={handleBack}
          />

          <Card {...styles.slot2}>
            <LoginForm
              onSubmit={handleSubmit}
              emailLabel={t("auth.email")}
              passwordLabel={t("auth.password")}
              emailPlaceholder={t("auth.emailPlaceholder")}
              passwordPlaceholder={t("auth.passwordPlaceholder")}
              submitLabel={t("auth.loginButton")}
              submitIcon="🚀"
            />

            <RegisterPrompt
              message={t("auth.newToQuizMaster")}
              ctaLabel={t("auth.createAccount")}
              onCtaClick={handleRegisterNavigation}
              ctaIcon="✨"
            />
          </Card>
        </div>
      </Container>
    </LoginLayout>
  );
}
