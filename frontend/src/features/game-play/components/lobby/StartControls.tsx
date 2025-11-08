import { useTranslation } from "react-i18next";
import { BackToButton, Button } from "../../../../shared/components";

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
        className="glass-effect rounded-xl px-6 py-4 border-2 border-primary-500/30 animate-pulse-slow"
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-primary-400 text-sm sm:text-base flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
          </span>
          <span className="uppercase tracking-wider">
            {t("game.waitingForHost")}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
        className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            ▶
          </span>
          <span>{t("game.startGame").toUpperCase()}</span>
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            ◀
          </span>
        </span>
      </Button>

      {mustWaitForPlayers && (
        <div className="text-center mt-4">
          <p
            id={startHintId}
            className="font-mono text-xs text-light-500 animate-pulse"
            role="status"
            aria-live="polite"
          >
            {t("game.needOnePlayer")}
          </p>
        </div>
      )}

      {!hasQuestions && (
        <div className="text-center mt-2">
          <p
            id={questionHintId}
            className="font-mono text-xs text-danger-500 animate-pulse"
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
