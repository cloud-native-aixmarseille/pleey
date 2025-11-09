import { ReactNode } from "react";
import { Container } from "../../../../../shared/components";
import Confetti from "../../Confetti";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LeaderboardLayout", {
  slot1: "min-h-screen bg-dark-500 crt-screen p-4 sm:p-8 relative overflow-hidden",
  slot2: "absolute top-4 left-1/2 transform -translate-x-1/2 z-50",
  slot3: "glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow",
  slot4: "text-2xl animate-bounce-slow",
  slot5: "font-display text-accent-400 uppercase text-base tracking-wider",
  slot6: "absolute inset-0 bg-grid bg-grid-size opacity-20",
  slot7: "absolute inset-0 overflow-hidden pointer-events-none",
  slot8: "absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow",
  slot9: "absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow",
  slot10: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow",
  slot11: "absolute inset-0 bg-scanlines opacity-10 pointer-events-none",
  slot12: "relative z-10 pt-20",
});


interface LeaderboardLayoutProps {
  showConfetti: boolean;
  children: ReactNode;
}

export function LeaderboardLayout({
  showConfetti,
  children,
}: LeaderboardLayoutProps) {
  return (
    <div {...styles.slot1}>
      {showConfetti && <Confetti />}

      <div {...styles.slot2}>
        <div {...styles.slot3}>
          <span {...styles.slot4}>👑</span>
          <span {...styles.slot5}>
            HOST VIEW
          </span>
        </div>
      </div>

      <div {...styles.slot6} />

      <div {...styles.slot7}>
        <div {...styles.slot8} />
        <div
          {...styles.slot9}
          style={{ animationDelay: "1s" }}
        />
        <div
          {...styles.slot10}
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div {...styles.slot11} />

      <Container size="xl" {...styles.slot12}>
        {children}
      </Container>
    </div>
  );
}
