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
        className="flex items-center justify-center gap-3 rounded-2xl border border-primary-500/35 bg-primary-500/10 px-6 py-4 text-center shadow-[0_0_22px_rgba(101,74,255,0.15)] animate-pulse-slow"
        role="status"
        aria-live="polite"
        data-start-controls="waiting"
      >
        <p className="flex items-center justify-center gap-3 font-mono text-sm uppercase tracking-[0.3em] text-primary-200 sm:text-base">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500" />
          </span>
          <span>{t("game.waitingForHost")}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-start-controls="admin">
      {onBackToAdmin && (
        <BackToButton
          label={t("quiz.backToAdmin", "BACK TO ADMIN PANEL")}
          onClick={onBackToAdmin}
          fullWidth
        />
      )}

      <div className="transition-transform duration-200 hover:scale-[1.02]">
        <Button
          variant="success"
          size="xl"
          fullWidth
          effect="retro"
          onClick={onStartGame}
          disabled={cannotStartGame}
          aria-describedby={startButtonDescription || undefined}
        >
          <span className="flex items-center justify-center gap-4 text-lg sm:text-xl">
            <span aria-hidden="true">▶</span>
            <span>{t("game.startGame").toUpperCase()}</span>
            <span aria-hidden="true">◀</span>
          </span>
        </Button>
      </div>

      {mustWaitForPlayers && (
        <div className="mt-4 text-center">
          <p
            id={startHintId}
            className="font-mono text-xs uppercase tracking-[0.25em] text-light-500 animate-pulse"
            role="status"
            aria-live="polite"
          >
            {t("game.needOnePlayer")}
          </p>
        </div>
      )}

      {!hasQuestions && (
        <div className="mt-2 text-center">
          <p
            id={questionHintId}
            className="font-mono text-xs uppercase tracking-[0.25em] text-danger-400 animate-pulse"
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
