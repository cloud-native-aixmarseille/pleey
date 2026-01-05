import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArcadePage,
  Button,
  Card,
  PrimaryButton,
  QuickSettingsMenu,
} from "../../../shared/components";

const OVERLAY_CONTENT = (
  <>
    <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl animate-pulse-slow" />
    <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-secondary-500/20 blur-3xl animate-pulse-slow [animation-delay:200ms]" />
    <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/20 blur-3xl animate-glow" />
  </>
);

const CONTENT_WRAPPER_CLASSES = "relative flex w-full justify-center";
const QUICK_SETTINGS_WRAPPER_CLASSES =
  "fixed right-4 top-4 z-50 sm:right-6 sm:top-6";
const HERO_CARD_WRAPPER_CLASSES =
  "w-full max-w-3xl rounded-[var(--arcade-radius-xl)] border-4 border-primary-500 bg-light-50/95 text-dark-500 shadow-[0_0_45px_rgba(56,189,248,0.25)] dark:bg-dark-400/95 dark:text-light-100";
const HERO_CARD_CONTENT_CLASSES = "space-y-8 text-center";
const HERO_ICON_CLASSES =
  "mb-6 text-7xl drop-shadow-[0_0_20px_rgba(0,255,204,0.8)] animate-bounce-slow sm:text-8xl";
const HERO_TITLE_CLASSES =
  "text-gradient-neon text-4xl font-display animate-glow sm:text-6xl";
const HERO_SUBTITLE_WRAPPER_CLASSES =
  "relative inline-flex overflow-hidden border-2 border-accent-500 bg-light-100 px-6 py-3 dark:bg-dark-500";
const HERO_SUBTITLE_OVERLAY_CLASSES =
  "pointer-events-none absolute inset-0 bg-accent-500/10 animate-pulse";
const HERO_SUBTITLE_TEXT_CLASSES =
  "relative z-10 font-display text-xs uppercase tracking-[0.5em] text-dark-500 dark:text-accent-400 sm:text-sm";

const FEATURE_GRID_CLASSES = "grid grid-cols-1 gap-4 sm:grid-cols-3";
const FEATURE_CARD_BASE_CLASSES =
  "glass-effect group rounded-lg p-4 transition-transform duration-200 hover:scale-105";
const FEATURE_CARD_PRIMARY_CLASSES = `${FEATURE_CARD_BASE_CLASSES} border-2 border-primary-500/30 hover:border-primary-500`;
const FEATURE_CARD_SECONDARY_CLASSES = `${FEATURE_CARD_BASE_CLASSES} border-2 border-secondary-500/30 hover:border-secondary-500`;
const FEATURE_CARD_ACCENT_CLASSES = `${FEATURE_CARD_BASE_CLASSES} border-2 border-accent-500/30 hover:border-accent-500`;
const FEATURE_ICON_CLASSES = "mb-2 text-3xl group-hover:animate-wiggle";
const FEATURE_LABEL_PRIMARY_CLASSES =
  "font-display text-xxs uppercase text-dark-400 dark:text-accent-400";
const FEATURE_LABEL_SECONDARY_CLASSES =
  "font-display text-xxs uppercase text-dark-400 dark:text-secondary-400";

const ACTIONS_WRAPPER_CLASSES = "space-y-4";
const ACTION_BUTTON_CONTAINER_CLASSES = "sm:w-auto";
const ACTION_BUTTON_CONTENT_CLASSES = "flex items-center justify-center gap-3";

const AUTH_CTA_WRAPPER_CLASSES =
  "rounded-[var(--arcade-radius-lg)] border border-primary-500/20 bg-light-50/70 p-[2px] dark:bg-dark-700/40";

const FOOTER_WRAPPER_CLASSES = "mt-8 border-t-2 border-primary-500/30 pt-6";
const FOOTER_PRIMARY_TEXT_CLASSES =
  "font-mono text-xs uppercase tracking-widest text-dark-400 animate-pulse dark:text-light-400";
const FOOTER_SECONDARY_TEXT_CLASSES =
  "mt-2 font-mono text-xxs text-dark-300 dark:text-light-500";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isEditableTarget) {
        return;
      }

      navigate("/auth/login");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="crt-screen">
      <ArcadePage
        variant="gradient"
        padding="lg"
        disableVerticalPadding
        contentWidth="md"
        align="center"
        verticalAlign="center"
        gap="lg"
        overlays={OVERLAY_CONTENT}
      >
        <div className={CONTENT_WRAPPER_CLASSES}>
          <QuickSettingsMenu className={QUICK_SETTINGS_WRAPPER_CLASSES} />

          <div className={HERO_CARD_WRAPPER_CLASSES}>
            <Card padding="xl" surface="panel" border="none" motion="scale">
              <div className={HERO_CARD_CONTENT_CLASSES}>
                <div>
                  <div className={HERO_ICON_CLASSES}>🕹️</div>
                  <h1 className={HERO_TITLE_CLASSES}>{t("home.title")}</h1>
                  <div className={HERO_SUBTITLE_WRAPPER_CLASSES}>
                    <div className={HERO_SUBTITLE_OVERLAY_CLASSES} />
                    <p className={HERO_SUBTITLE_TEXT_CLASSES}>
                      {t("home.subtitle")}
                    </p>
                  </div>
                </div>

                <div className={FEATURE_GRID_CLASSES}>
                  <div className={FEATURE_CARD_PRIMARY_CLASSES}>
                    <div className={FEATURE_ICON_CLASSES}>⚡</div>
                    <p className={FEATURE_LABEL_PRIMARY_CLASSES}>
                      {t("home.fast")}
                    </p>
                  </div>
                  <div className={FEATURE_CARD_SECONDARY_CLASSES}>
                    <div className={FEATURE_ICON_CLASSES}>🎯</div>
                    <p className={FEATURE_LABEL_SECONDARY_CLASSES}>
                      {t("home.epic")}
                    </p>
                  </div>
                  <div className={FEATURE_CARD_ACCENT_CLASSES}>
                    <div className={FEATURE_ICON_CLASSES}>🏆</div>
                    <p className={FEATURE_LABEL_PRIMARY_CLASSES}>
                      {t("home.win")}
                    </p>
                  </div>
                </div>

                <div className={ACTIONS_WRAPPER_CLASSES}>
                  <div className={ACTION_BUTTON_CONTAINER_CLASSES}>
                    <PrimaryButton
                      size="lg"
                      fullWidth
                      effect="retro"
                      onClick={() => navigate("/auth/login")}
                    >
                      <span className={ACTION_BUTTON_CONTENT_CLASSES}>
                        <span>{t("home.login")}</span>
                      </span>
                    </PrimaryButton>
                  </div>
                  <div className={ACTION_BUTTON_CONTAINER_CLASSES}>
                    <div className={AUTH_CTA_WRAPPER_CLASSES}>
                      <Button
                        variant="ghost"
                        tone="accent"
                        size="md"
                        fullWidth
                        onClick={() => navigate("/auth/register")}
                      >
                        <span className={ACTION_BUTTON_CONTENT_CLASSES}>
                          <span>{t("home.signup")}</span>
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={FOOTER_WRAPPER_CLASSES}>
                  <p className={FOOTER_PRIMARY_TEXT_CLASSES}>
                    {t("home.insertCoin")}
                  </p>
                  <p className={FOOTER_SECONDARY_TEXT_CLASSES}>
                    {t("home.playersOnline")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ArcadePage>
    </div>
  );
}
