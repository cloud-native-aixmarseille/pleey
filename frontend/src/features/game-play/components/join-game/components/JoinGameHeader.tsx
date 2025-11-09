import { BackToButton } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameHeader", {
  slot1: "text-center mb-10",
  slot2: "mb-6 flex justify-center",
  slot3: "relative inline-block mb-6",
  slot4: "text-7xl animate-bounce-slow",
  slot5: "absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full animate-pulse",
  slot6: "font-display text-4xl sm:text-5xl uppercase text-neon text-accent-500 mb-3 tracking-wider",
  slot7: "text-light-300 font-mono text-sm sm:text-base animate-pulse-slow",
});


interface JoinGameHeaderProps {
  onNavigateHome: () => void;
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = "► JOIN GAME";
const DEFAULT_SUBTITLE = "> Enter the PIN code to start playing";

export function JoinGameHeader({
  onNavigateHome,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}: JoinGameHeaderProps) {
  return (
    <header {...styles.slot1}>
      <div {...styles.slot2}>
        <BackToButton
          label="BACK TO MENU"
          onClick={onNavigateHome}
          variant="link"
          tone="accent"
          aria-label="Back to main menu"
        />
      </div>

      <div {...styles.slot3}>
        <div {...styles.slot4}>🎮</div>
        <div {...styles.slot5} />
      </div>

      <h1 {...styles.slot6}>
        {title}
      </h1>
      <p {...styles.slot7}>
        {subtitle}
      </p>
    </header>
  );
}
