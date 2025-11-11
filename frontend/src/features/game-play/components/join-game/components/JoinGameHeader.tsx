import {
  ArcadeSectionHeader,
  BackToButton,
} from "../../../../../shared/components";
import { useTranslation } from "react-i18next";

const HEADER_WRAPPER_CLASSES = "mb-10";
const BACK_BUTTON_WRAPPER_CLASSES = "mb-6 flex justify-center sm:justify-start";

interface JoinGameHeaderProps {
  onNavigateHome: () => void;
  title?: string;
  subtitle?: string;
}

export function JoinGameHeader({
  onNavigateHome,
  title,
  subtitle,
}: JoinGameHeaderProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("game.joinPage.header.title");
  const resolvedSubtitle = subtitle ?? t("game.joinPage.header.subtitle");
  const backLabel = t("game.joinPage.header.backLabel");
  const backAria = t("game.joinPage.header.backAria");

  return (
    <header className={HEADER_WRAPPER_CLASSES}>
      <div className={BACK_BUTTON_WRAPPER_CLASSES}>
        <BackToButton
          label={backLabel}
          onClick={onNavigateHome}
          variant="link"
          tone="accent"
          aria-label={backAria}
        />
      </div>
      <ArcadeSectionHeader
        icon="🎮"
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        align="center"
      />
    </header>
  );
}
