import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Container, Input } from "../../../shared/components";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notifyFromError } = useNotifications();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    try {
      await onLogin(email, password);
    } catch (error) {
      notifyFromError(error, "auth.errors.invalidCredentials");
    }
  };

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-white hover:text-primary-400 transition-colors mb-4"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">{t("auth.back")}</span>
            </button>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
              {t("auth.loginTitle")}
            </h2>
            <p className="text-light-400">{t("auth.loginSubtitle")}</p>
          </div>

          <Card className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <Input
                type="email"
                name="email"
                placeholder="votre@email.com"
                label={t("auth.email")}
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

              {/* Password Input */}
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                label={t("auth.password")}
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

              {/* Submit Button */}
              <Button type="submit" variant="primary" size="lg" fullWidth>
                <span className="flex items-center justify-center gap-2">
                  <span>{t("auth.loginButton")}</span>
                  <span>🚀</span>
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-light-600 font-medium">
                  {t("auth.newToQuizMaster")}
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => navigate("/auth/register")}
              className="border-2 border-primary-500/20"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{t("auth.createAccount")}</span>
                <span>✨</span>
              </span>
            </Button>
          </Card>
        </div>
      </Container>
    </div>
  );
}
