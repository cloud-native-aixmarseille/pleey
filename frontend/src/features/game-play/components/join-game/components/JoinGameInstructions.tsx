interface JoinGameInstructionsProps {
  title?: string;
  items?: string[];
}

const DEFAULT_TITLE = "► HOW TO JOIN";
const DEFAULT_ITEMS = [
  "Ask the game host for the 6-character PIN code",
  "The PIN is displayed in large text on the host's screen",
  "Enter it above and press START GAME to join!",
];

export function JoinGameInstructions({
  title = DEFAULT_TITLE,
  items = DEFAULT_ITEMS,
}: JoinGameInstructionsProps) {
  return (
    <section className="mt-8 glass-effect rounded-xl p-5 border-2 border-accent-500/30">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div className="flex-1">
          <p className="font-display text-accent-400 text-xxs mb-2 uppercase tracking-wider">
            {title}
          </p>
          <ul className="font-mono text-xs text-light-300 space-y-1">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-accent-500 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
