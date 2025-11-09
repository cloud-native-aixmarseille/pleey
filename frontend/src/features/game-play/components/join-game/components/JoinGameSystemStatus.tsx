import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameSystemStatus", {
  slot1: "mb-8 pb-4 border-b-2 border-primary-500/30",
  slot2: "font-mono text-accent-400 text-xs sm:text-sm",
  slot3: "text-success-500 animate-pulse",
  slot4: "font-mono text-primary-300 text-xs mt-1",
});

interface JoinGameSystemStatusProps {
  statusMessage?: string;
}

const DEFAULT_STATUS_MESSAGE = "> WAITING FOR INPUT...";

export function JoinGameSystemStatus({
  statusMessage = DEFAULT_STATUS_MESSAGE,
}: JoinGameSystemStatusProps) {
  return (
    <section {...styles.slot1}>
      <p {...styles.slot2}>
        <span {...styles.slot3}>●</span> SYSTEM READY
      </p>
      <p {...styles.slot4}>{statusMessage}</p>
    </section>
  );
}
