import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackToButton,
  ConfirmModal,
  DangerButton,
  PrimaryButton,
} from "../../../../../presentation/shared/ui/components";

interface StartControlsProps {
  readonly isHost: boolean;
  readonly cannotStartGame: boolean;
  readonly onStartGame: () => void;
  readonly onStopSession?: () => void;
  readonly onBackToHost?: () => void;
  readonly startButtonDescription?: string;
  readonly startHintId: string;
  readonly questionHintId: string;
  readonly mustWaitForPlayers: boolean;
  readonly hasQuestions: boolean;
}

export default function StartControls({
  isHost,
  cannotStartGame,
  onStartGame,
  onStopSession,
  onBackToHost,
  startButtonDescription,
  startHintId,
  questionHintId,
  mustWaitForPlayers,
  hasQuestions,
}: StartControlsProps) {
  const { t } = useTranslation();
  const [isStopSessionModalOpen, setIsStopSessionModalOpen] = useState(false);
  const [isStoppingSession, setIsStoppingSession] = useState(false);

  if (!isHost) {
    return (
      <div
        className="flex items-center justify-center gap-3 rounded-2xl border border-primary-500/35 bg-primary-500/10 px-6 py-4 text-center shadow-[0_0_22px_rgba(101,74,255,0.15)] animate-pulse-slow"
        role="status"
        aria-live="polite"
        data-start-controls="waiting"
      >
        <p className="flex items-center justify-center gap-3 font-mono text-sm uppercase tracking-[0.3em] text-primary-900 dark:text-primary-200 sm:text-base">
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
    <div className="space-y-3" data-start-controls="host">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start">
        <div className="flex flex-col gap-3 sm:justify-self-start">
          {onBackToHost && (
            <div className="w-full sm:w-auto sm:max-w-xs">
              <BackToButton
                label={t("game.backToHostPanel")}
                onClick={onBackToHost}
                fullWidth
              />
            </div>
          )}

          {onStopSession && (
            <div className="w-full sm:w-auto sm:max-w-xs">
              <DangerButton
                size="lg"
                effect="retro"
                fullWidth
                onClick={() => setIsStopSessionModalOpen(true)}
                disabled={isStoppingSession}
              >
                <span className="flex items-center justify-center gap-3 text-base sm:text-lg">
                  <span aria-hidden="true">■</span>
                  <span>
                    {t("game.stopSession", "Stop Session").toUpperCase()}
                  </span>
                </span>
              </DangerButton>
            </div>
          )}
        </div>

        <div className="flex justify-center sm:justify-self-center">
          <div className="w-full max-w-sm">
            <PrimaryButton
              size="xl"
              effect="retro"
              fullWidth
              onClick={onStartGame}
              disabled={cannotStartGame}
              aria-describedby={startButtonDescription || undefined}
            >
              <span className="flex items-center justify-center gap-4 text-lg sm:text-xl">
                <span aria-hidden="true">▶</span>
                <span>{t("game.startGame").toUpperCase()}</span>
                <span aria-hidden="true">◀</span>
              </span>
            </PrimaryButton>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true" />
      </div>

      {mustWaitForPlayers && (
        <div className="mt-4 text-center">
          <p
            id={startHintId}
            className="font-mono text-lg sm:text-xl uppercase tracking-[0.25em] text-dark-400 dark:text-light-500 animate-pulse"
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

      {onStopSession ? (
        <ConfirmModal
          isOpen={isStopSessionModalOpen}
          onCancel={() => setIsStopSessionModalOpen(false)}
          onConfirm={async () => {
            try {
              setIsStoppingSession(true);
              await onStopSession();
              setIsStopSessionModalOpen(false);
            } finally {
              setIsStoppingSession(false);
            }
          }}
          isProcessing={isStoppingSession}
          title={t("game.stopSessionConfirmTitle")}
          description={t("game.stopSessionConfirmDescription")}
          confirmLabel={t("game.stopSession")}
          body={t("game.stopSessionConfirmPrompt")}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
