import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "../../../../../presentation/shared/ui/components";

import { RegisterLayout } from "./components/RegisterLayout";
import { RegisterHeader } from "./components/RegisterHeader";
import { RegisterForm } from "./components/RegisterForm";
import { LoginPrompt } from "./components/LoginPrompt";
import type { RegisterCredentials } from "./types";
import {
  PatienceOverlay,
  PatiencePlayground,
} from "../../../../shared/ui/patience";
import { useUserIdle } from "../../../../shared/ui/patience/hooks/useUserIdle";

const PAGE_CONTENT_CLASSES = "flex flex-col gap-6 animate-slide-up";
const CARD_CONTENT_CLASSES = "space-y-6";

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
  const isIdle = useUserIdle(true, 10_000);

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
    <PatiencePlayground className="relative">
      <RegisterLayout>
        <div className={PAGE_CONTENT_CLASSES}>
          <RegisterHeader
            title={t("auth.registerTitle")}
            subtitle={t("auth.registerSubtitle")}
            backLabel={t("auth.back")}
            onBack={handleBack}
          />

          <Card padding="xl" surface="panel" border="none" motion="slide-up">
            <div className={CARD_CONTENT_CLASSES}>
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
            </div>
          </Card>
        </div>
      </RegisterLayout>

      <PatienceOverlay active={isIdle} />
    </PatiencePlayground>
  );
}
