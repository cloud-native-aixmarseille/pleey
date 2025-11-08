import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Container,
  PrimaryButton,
} from "../../../shared/components";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden crt-screen">
      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Animated neon grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-glow"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <Card className="p-10 sm:p-12 text-center animate-scale-in border-4 border-primary-500 bg-dark-400">
          {/* Retro arcade-style logo */}
          <div className="mb-8">
            <div className="text-7xl sm:text-8xl mb-6 animate-bounce-slow filter drop-shadow-[0_0_20px_rgba(0,255,204,0.8)]">
              🕹️
            </div>
            <h1 className="text-4xl sm:text-6xl font-display mb-4 text-gradient-neon text-neon animate-glow">
              {t("home.title")}
            </h1>
            <div className="inline-block px-6 py-3 bg-dark-500 rounded-none border-2 border-accent-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-500/10 animate-pulse"></div>
              <p className="text-accent-400 font-display text-xs sm:text-sm uppercase tracking-widest relative z-10 animate-flicker">
                {t("home.subtitle")}
              </p>
            </div>
          </div>

          {/* Pixel art style feature badges */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-effect rounded-lg p-4 border-2 border-primary-500/30 hover:border-primary-500 transition-all hover:scale-110 group">
              <div className="text-3xl mb-2 group-hover:animate-wiggle">⚡</div>
              <p className="text-xxs font-display text-accent-400 uppercase">
                {t("home.fast")}
              </p>
            </div>
            <div className="glass-effect rounded-lg p-4 border-2 border-secondary-500/30 hover:border-secondary-500 transition-all hover:scale-110 group">
              <div className="text-3xl mb-2 group-hover:animate-wiggle">🎯</div>
              <p className="text-xxs font-display text-secondary-400 uppercase">
                {t("home.epic")}
              </p>
            </div>
            <div className="glass-effect rounded-lg p-4 border-2 border-accent-500/30 hover:border-accent-500 transition-all hover:scale-110 group">
              <div className="text-3xl mb-2 group-hover:animate-wiggle">🏆</div>
              <p className="text-xxs font-display text-accent-400 uppercase">
                {t("home.win")}
              </p>
            </div>
          </div>

          {/* Arcade-style action buttons with pixel shadow */}
          <div className="space-y-4">
            <PrimaryButton
              size="lg"
              fullWidth
              onClick={() => navigate("/auth/login")}
              className="retro-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-display text-base"
            >
              <span className="flex items-center justify-center gap-3">
                <span>{t("home.login")}</span>
              </span>
            </PrimaryButton>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => navigate("/auth/register")}
              className="retro-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-display text-base"
            >
              <span className="flex items-center justify-center gap-3">
                <span>{t("home.signup")}</span>
              </span>
            </Button>
          </div>

          {/* Retro footer */}
          <div className="mt-8 pt-6 border-t-2 border-primary-500/30">
            <p className="text-light-400 text-xs font-mono uppercase tracking-wider animate-pulse">
              {t("home.insertCoin")}
            </p>
            <p className="text-light-500 text-xxs font-mono mt-2">
              {t("home.playersOnline")}
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
