import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Container,
  PrimaryButton,
} from "../../../shared/components";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher";
import { createStyles } from "../../../shared/ui/styles";

const styles = createStyles("HomePage", {
  slot1: "min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden crt-screen",
  slot2: "absolute inset-0 overflow-hidden pointer-events-none",
  slot3: "absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow",
  slot4: "absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-200",
  slot5: "absolute top-1/2 left-1/2 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-glow",
  slot6: "relative z-10",
  slot7: "p-10 sm:p-12 text-center animate-scale-in border-4 border-primary-500 bg-dark-400",
  slot8: "mb-8",
  slot9: "text-7xl sm:text-8xl mb-6 animate-bounce-slow filter drop-shadow-[0_0_20px_rgba(0,255,204,0.8)]",
  slot10: "text-4xl sm:text-6xl font-display mb-4 text-gradient-neon text-neon animate-glow",
  slot11: "inline-block px-6 py-3 bg-dark-500 rounded-none border-2 border-accent-500 relative overflow-hidden",
  slot12: "absolute inset-0 bg-accent-500/10 animate-pulse",
  slot13: "text-accent-400 font-display text-xs sm:text-sm uppercase tracking-widest relative z-10 animate-flicker",
  slot14: "grid grid-cols-3 gap-4 mb-8",
  slot15: "glass-effect rounded-lg p-4 border-2 border-primary-500/30 hover:border-primary-500 transition-all hover:scale-110 group",
  slot16: "text-3xl mb-2 group-hover:animate-wiggle",
  slot17: "text-xxs font-display text-accent-400 uppercase",
  slot18: "glass-effect rounded-lg p-4 border-2 border-secondary-500/30 hover:border-secondary-500 transition-all hover:scale-110 group",
  slot19: "text-xxs font-display text-secondary-400 uppercase",
  slot20: "glass-effect rounded-lg p-4 border-2 border-accent-500/30 hover:border-accent-500 transition-all hover:scale-110 group",
  slot21: "space-y-4",
  slot22: "sm:w-auto",
  slot23: "flex items-center justify-center gap-3",
  slot24: "mt-8 pt-6 border-t-2 border-primary-500/30",
  slot25: "text-light-400 text-xs font-mono uppercase tracking-wider animate-pulse",
  slot26: "text-light-500 text-xxs font-mono mt-2",
});


export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div {...styles.slot1}>
      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Animated neon grid background */}
      <div {...styles.slot2}>
        <div {...styles.slot3}></div>
        <div {...styles.slot4}></div>
        <div {...styles.slot5}></div>
      </div>

      <Container size="sm" {...styles.slot6}>
        <Card {...styles.slot7}>
          {/* Retro arcade-style logo */}
          <div {...styles.slot8}>
            <div {...styles.slot9}>
              🕹️
            </div>
            <h1 {...styles.slot10}>
              {t("home.title")}
            </h1>
            <div {...styles.slot11}>
              <div {...styles.slot12}></div>
              <p {...styles.slot13}>
                {t("home.subtitle")}
              </p>
            </div>
          </div>

          {/* Pixel art style feature badges */}
          <div {...styles.slot14}>
            <div {...styles.slot15}>
              <div {...styles.slot16}>⚡</div>
              <p {...styles.slot17}>
                {t("home.fast")}
              </p>
            </div>
            <div {...styles.slot18}>
              <div {...styles.slot16}>🎯</div>
              <p {...styles.slot19}>
                {t("home.epic")}
              </p>
            </div>
            <div {...styles.slot20}>
              <div {...styles.slot16}>🏆</div>
              <p {...styles.slot17}>
                {t("home.win")}
              </p>
            </div>
          </div>

          {/* Arcade-style action buttons with pixel shadow */}
          <div {...styles.slot21}>
            <div {...styles.slot22}>
              <PrimaryButton
                size="lg"
                fullWidth
                effect="retro"
                onClick={() => navigate("/auth/login")}
              >
                <span {...styles.slot23}>
                  <span>{t("home.login")}</span>
                </span>
              </PrimaryButton>
            </div>
            <div {...styles.slot22}>
              <Button
                variant="accent"
                size="lg"
                fullWidth
                effect="retro"
                onClick={() => navigate("/auth/register")}
              >
                <span {...styles.slot23}>
                  <span>{t("home.signup")}</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Retro footer */}
          <div {...styles.slot24}>
            <p {...styles.slot25}>
              {t("home.insertCoin")}
            </p>
            <p {...styles.slot26}>
              {t("home.playersOnline")}
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
