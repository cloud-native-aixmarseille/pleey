import { BackToButton } from "../../../../../shared/components";

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
    <header className="text-center mb-10">
      <div className="mb-6 flex justify-center">
        <BackToButton
          label="BACK TO MENU"
          onClick={onNavigateHome}
          variant="link"
          tone="accent"
          aria-label="Back to main menu"
        />
      </div>

      <div className="relative inline-block mb-6">
        <div className="text-7xl animate-bounce-slow">🎮</div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full animate-pulse" />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl uppercase text-neon text-accent-500 mb-3 tracking-wider">
        {title}
      </h1>
      <p className="text-light-300 font-mono text-sm sm:text-base animate-pulse-slow">
        {subtitle}
      </p>
    </header>
  );
}
