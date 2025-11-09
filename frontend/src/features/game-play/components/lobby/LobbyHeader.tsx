import { useTranslation } from "react-i18next";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("LobbyHeader", {
  slot1: "text-center mb-8",
  slot2: "font-display text-3xl sm:text-4xl md:text-5xl uppercase text-neon text-accent-500 mb-2 tracking-wider animate-glow",
  slot3: "font-mono text-primary-300 text-xs sm:text-sm animate-pulse-slow",
});


interface LobbyHeaderProps {
  readonly titleId: string;
}

export default function LobbyHeader({ titleId }: LobbyHeaderProps) {
  const { t } = useTranslation();

  return (
    <div {...styles.slot1}>
      <h1
        id={titleId}
        {...styles.slot2}
      >
        {t("game.gameLobby")}
      </h1>
      <p {...styles.slot3}>
        {t("game.waitingForPlayersToJoin")}
      </p>
    </div>
  );
}
