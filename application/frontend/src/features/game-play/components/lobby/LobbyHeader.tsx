import { useTranslation } from "react-i18next";

interface LobbyHeaderProps {
  readonly titleId: string;
}

export default function LobbyHeader({ titleId }: LobbyHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 text-center" data-lobby-header="true">
      <h1
        id={titleId}
        className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.35em] text-accent-200 drop-shadow-[0_0_18px_rgba(255,51,198,0.45)] animate-glow"
      >
        {t("game.gameLobby")}
      </h1>
      <p className="font-mono text-xs sm:text-sm text-primary-300 animate-pulse-slow">
        {t("game.waitingForPlayersToJoin")}
      </p>
    </div>
  );
}
