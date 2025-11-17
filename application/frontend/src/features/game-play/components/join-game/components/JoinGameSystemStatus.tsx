import { useTranslation } from "react-i18next";

const STATUS_WRAPPER_CLASSES = "mb-8 border-b-2 border-primary-500/30 pb-4";
const STATUS_LABEL_CLASSES = "font-mono text-xs text-accent-400 sm:text-sm";
const STATUS_INDICATOR_CLASSES = "text-success-500 animate-pulse";
const STATUS_MESSAGE_CLASSES = "mt-1 font-mono text-xs text-primary-300";

interface JoinGameSystemStatusProps {
  statusMessage?: string;
}

export function JoinGameSystemStatus({
  statusMessage,
}: JoinGameSystemStatusProps) {
  const { t } = useTranslation();
  const resolvedStatusMessage =
    statusMessage ?? t("game.joinPage.systemStatus.waiting");

  return (
    <section className={STATUS_WRAPPER_CLASSES}>
      <p className={STATUS_LABEL_CLASSES}>
        <span className={STATUS_INDICATOR_CLASSES}>●</span>{" "}
        {t("game.joinPage.systemStatus.label")}
      </p>
      <p className={STATUS_MESSAGE_CLASSES}>{resolvedStatusMessage}</p>
    </section>
  );
}
