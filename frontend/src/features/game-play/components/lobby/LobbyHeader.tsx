import { useTranslation } from "react-i18next";

interface LobbyHeaderProps {
  readonly titleId: string;
}

export default function LobbyHeader({ titleId }: LobbyHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-8">
      <h1
        id={titleId}
        className="font-display text-3xl sm:text-4xl md:text-5xl uppercase text-neon text-accent-500 mb-2 tracking-wider animate-glow"
      >
        {t("game.gameLobby")}
      </h1>
      <p className="font-mono text-primary-300 text-xs sm:text-sm animate-pulse-slow">
        {t("game.waitingForPlayersToJoin")}
      </p>
    </div>
  );
}
