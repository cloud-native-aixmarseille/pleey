import { useTranslation } from "react-i18next";

const FOOTER_WRAPPER_CLASSES = "mt-6 text-center";
const FOOTER_TEXT_CLASSES =
  "font-mono text-xs text-primary-400 animate-pulse-slow";

export function JoinGameFooterMessage() {
  const { t } = useTranslation();

  return (
    <footer className={FOOTER_WRAPPER_CLASSES}>
      <p className={FOOTER_TEXT_CLASSES}>{t("game.joinPage.footer")}</p>
    </footer>
  );
}
