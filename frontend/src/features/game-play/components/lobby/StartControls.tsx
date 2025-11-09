import { useTranslation } from "react-i18next";
import { BackToButton, Button } from "../../../../shared/components";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("StartControls", {
  slot1: "glass-effect rounded-xl px-6 py-4 border-2 border-primary-500/30 animate-pulse-slow",
  slot2: "font-mono text-primary-400 text-sm sm:text-base flex items-center justify-center gap-3",
  slot3: "relative flex h-3 w-3",
  slot4: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75",
  slot5: "relative inline-flex rounded-full h-3 w-3 bg-primary-500",
  slot6: "uppercase tracking-wider",
  slot7: "space-y-3",
  slot8: "retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all",
  slot9: "flex items-center justify-center gap-3",
  slot10: "text-xl sm:text-2xl",
  slot11: "text-center mt-4",
  slot12: "font-mono text-xs text-light-500 animate-pulse",
  slot13: "text-center mt-2",
  slot14: "font-mono text-xs text-danger-500 animate-pulse",
});


interface StartControlsProps {
  readonly isAdmin: boolean;
  readonly cannotStartGame: boolean;
  readonly onStartGame: () => void;
  readonly onBackToAdmin?: () => void;
  readonly startButtonDescription?: string;
  readonly startHintId: string;
  readonly questionHintId: string;
  readonly mustWaitForPlayers: boolean;
  readonly hasQuestions: boolean;
}

export default function StartControls({
  isAdmin,
  cannotStartGame,
  onStartGame,
  onBackToAdmin,
  startButtonDescription,
  startHintId,
  questionHintId,
  mustWaitForPlayers,
  hasQuestions,
}: StartControlsProps) {
  const { t } = useTranslation();

  if (!isAdmin) {
    return (
      <div
        {...styles.slot1}
        role="status"
        aria-live="polite"
      >
        <p {...styles.slot2}>
          <span {...styles.slot3} aria-hidden="true">
            <span {...styles.slot4} />
            <span {...styles.slot5} />
          </span>
          <span {...styles.slot6}>
            {t("game.waitingForHost")}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div {...styles.slot7}>
      {onBackToAdmin && (
        <BackToButton
          label={t("quiz.backToAdmin", "BACK TO ADMIN PANEL")}
          onClick={onBackToAdmin}
          fullWidth
        />
      )}

      <Button
        variant="success"
        size="xl"
        fullWidth
        onClick={onStartGame}
        disabled={cannotStartGame}
        aria-describedby={startButtonDescription}
        {...styles.slot8}
      >
        <span {...styles.slot9}>
          <span {...styles.slot10} aria-hidden="true">
            ▶
          </span>
          <span>{t("game.startGame").toUpperCase()}</span>
          <span {...styles.slot10} aria-hidden="true">
            ◀
          </span>
        </span>
      </Button>

      {mustWaitForPlayers && (
        <div {...styles.slot11}>
          <p
            id={startHintId}
            {...styles.slot12}
            role="status"
            aria-live="polite"
          >
            {t("game.needOnePlayer")}
          </p>
        </div>
      )}

      {!hasQuestions && (
        <div {...styles.slot13}>
          <p
            id={questionHintId}
            {...styles.slot14}
            role="status"
            aria-live="polite"
          >
            {t("game.addOneQuestion")}
          </p>
        </div>
      )}
    </div>
  );
}
