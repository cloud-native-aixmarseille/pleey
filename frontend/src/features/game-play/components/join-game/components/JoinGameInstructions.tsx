import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameInstructions", {
  slot1: "mt-8 glass-effect rounded-xl p-5 border-2 border-accent-500/30",
  slot2: "flex items-start gap-3",
  slot3: "text-2xl flex-shrink-0",
  slot4: "flex-1",
  slot5: "font-display text-accent-400 text-xxs mb-2 uppercase tracking-wider",
  slot6: "font-mono text-xs text-light-300 space-y-1",
  slot7: "flex items-start gap-2",
  slot8: "text-accent-500 flex-shrink-0",
});

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
    <section {...styles.slot1}>
      <div {...styles.slot2}>
        <span {...styles.slot3}>💡</span>
        <div {...styles.slot4}>
          <p {...styles.slot5}>
            {title}
          </p>
          <ul {...styles.slot6}>
            {items.map((item, index) => (
              <li key={index} {...styles.slot7}>
                <span {...styles.slot8}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
