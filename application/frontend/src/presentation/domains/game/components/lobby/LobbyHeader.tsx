import { useTranslation } from "react-i18next";

interface LobbyHeaderProps {
  readonly titleId: string;
  readonly quizTitle?: string | null;
}

export default function LobbyHeader({
  titleId,
  quizTitle = null,
}: LobbyHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-6 mb-8 text-center" data-lobby-header="true">
      <h1
        id={titleId}
        className="font-display text-xl xs:text-2xl sm:text-4xl md:text-5xl uppercase tracking-[0.15em] sm:tracking-[0.35em] whitespace-nowrap text-primary-900 dark:text-accent-200 dark:drop-shadow-[0_0_18px_rgba(255,51,198,0.45)] dark:animate-glow"
      >
        {t("game.gameLobby")}
      </h1>
      {quizTitle ? (
        <p
          className="mt-3 font-mono text-2xl sm:text-3xl text-dark-400 dark:text-primary-300"
          data-testid="lobby-quiz-title"
        >
          {quizTitle}
        </p>
      ) : null}
      <p className="font-mono text-lg sm:text-xl text-dark-400 dark:text-primary-300 animate-pulse-slow">
        {t("game.waitingForPlayersToJoin")}
      </p>
    </div>
  );
}
