import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "../../../../../presentation/shared/ui/components";
import { useNotifications } from "../../../app-shell";

import { LoginLayout } from "./components/LoginLayout";
import { LoginHeader } from "./components/LoginHeader";
import { LoginForm } from "./components/LoginForm";
import { RegisterPrompt } from "./components/RegisterPrompt";
import type { LoginCredentials } from "./types";

const PAGE_CONTENT_CLASSES = "flex flex-col gap-6 animate-slide-up";
const CARD_CONTENT_CLASSES = "space-y-6";

interface SignInPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function SignInPage({ onLogin }: SignInPageProps) {
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
      <div className={PAGE_CONTENT_CLASSES}>
        <LoginHeader
          title={t("auth.loginTitle")}
          subtitle={t("auth.loginSubtitle")}
          backLabel={t("auth.back")}
          onBack={handleBack}
        />

        <Card padding="xl" surface="panel" border="none" motion="slide-up">
          <div className={CARD_CONTENT_CLASSES}>
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
          </div>
        </Card>
      </div>
    </LoginLayout>
  );
}
