import { ReactNode } from "react";
import { Container } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameLayout", {
  slot1: "min-h-screen bg-game-gradient crt-screen flex items-center justify-center p-4 relative overflow-hidden",
  slot2: "absolute inset-0 overflow-hidden pointer-events-none",
  slot3: "absolute top-20 left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-float",
  slot4: "absolute bottom-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200",
  slot5: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow",
  slot6: "relative z-10",
  slot7: "animate-slide-up",
});


interface JoinGameLayoutProps {
  children: ReactNode;
}

export function JoinGameLayout({ children }: JoinGameLayoutProps) {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <div {...styles.slot3} />
        <div {...styles.slot4} />
        <div {...styles.slot5} />
      </div>

      <Container size="sm" {...styles.slot6}>
        <div {...styles.slot7}>{children}</div>
      </Container>
    </div>
  );
}
