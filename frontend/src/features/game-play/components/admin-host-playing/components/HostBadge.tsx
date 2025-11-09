import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("HostBadge", {
  slot1: "mb-4 flex justify-center",
  slot2: "glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow",
  slot3: "text-3xl animate-bounce-slow",
  slot4: "font-display text-accent-400 uppercase text-lg tracking-wider",
});

export function HostBadge() {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <span {...styles.slot3}>👑</span>
        <span {...styles.slot4}>
          HOST VIEW - SCREEN SHARE MODE
        </span>
      </div>
    </div>
  );
}
