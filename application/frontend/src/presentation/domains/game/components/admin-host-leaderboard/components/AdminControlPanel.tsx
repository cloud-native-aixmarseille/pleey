import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AnimationStage } from "../constants";
import {
  ArcadeGlassStack,
  BackToButton,
  Card,
  SecondaryButton,
} from "../../../../../../presentation/shared/ui/components";

const PANEL_WRAPPER_CLASSES = "mx-auto max-w-2xl space-y-6 animate-fade-in";
const BUTTON_CONTENT_CLASSES = "flex items-center justify-center gap-4";
const BUTTON_ICON_CLASSES = "text-3xl";
const PANEL_FOOTER_WRAPPER_CLASSES = "pt-6 text-center";
const PANEL_FOOTER_TEXT_CLASSES = "font-body text-lg text-light-400 sm:text-xl";

interface AdminControlPanelProps {
  animationStage: AnimationStage;
}

export function AdminControlPanel({ animationStage }: AdminControlPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (animationStage < 5) {
    return null;
  }

  const handleNavigateAdmin = () => {
    navigate("/admin", { replace: true });
  };

  const handleNavigateHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className={PANEL_WRAPPER_CLASSES} style={{ animationDelay: "0.5s" }}>
      <Card
        surface="panel"
        variant="accent"
        padding="lg"
        border="thick"
        elevation="panel"
        alignment="center"
      >
        <ArcadeGlassStack
          title={t("game.hostLeaderboard.controls.heading")}
          align="center"
          tone="accent"
          spacing="lg"
        >
          <div className="space-y-4">
            <BackToButton
              fullWidth
              alignment="center"
              onClick={handleNavigateAdmin}
              label={t("game.hostLeaderboard.controls.backToAdmin")}
            />

            <SecondaryButton
              size="xl"
              fullWidth
              effect="retro"
              onClick={handleNavigateHome}
            >
              <span className={BUTTON_CONTENT_CLASSES}>
                <span className={BUTTON_ICON_CLASSES} aria-hidden>
                  🎮
                </span>
                <span>{t("game.hostLeaderboard.controls.newGame")}</span>
              </span>
            </SecondaryButton>
          </div>
        </ArcadeGlassStack>
      </Card>

      <div className={PANEL_FOOTER_WRAPPER_CLASSES}>
        <p className={PANEL_FOOTER_TEXT_CLASSES}>
          {t("game.hostLeaderboard.controls.footer")}
        </p>
      </div>
    </div>
  );
}
