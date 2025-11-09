import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameFooterMessage", {
  slot1: "mt-6 text-center",
  slot2: "font-mono text-primary-400 text-xs animate-pulse-slow",
});

export function JoinGameFooterMessage() {
  return (
    <footer {...styles.slot1}>
      <p {...styles.slot2}>
        &gt; GET READY FOR AN EPIC QUIZ BATTLE! &lt;
      </p>
    </footer>
  );
}
