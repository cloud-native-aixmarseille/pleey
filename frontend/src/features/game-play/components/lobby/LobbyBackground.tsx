import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("LobbyBackground", {
  slot1: "absolute inset-0 overflow-hidden pointer-events-none",
  slot2: "absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float",
  slot3: "absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-300",
  slot4: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary-500/5 rounded-full blur-3xl animate-pulse-slow",
});

export default function LobbyBackground() {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2} />
      <div {...styles.slot3} />
      <div {...styles.slot4} />
    </div>
  );
}
