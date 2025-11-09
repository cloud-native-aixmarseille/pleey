import { ReactNode } from "react";

import { Container } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("PlayingLayout", {
  slot1: "min-h-screen bg-game-gradient p-4 relative overflow-hidden",
  slot2: "absolute inset-0 overflow-hidden pointer-events-none",
  slot3: "absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow",
  slot4: "absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200",
  slot5: "relative z-10",
});


interface PlayingLayoutProps {
  children: ReactNode;
}

export function PlayingLayout({ children }: PlayingLayoutProps) {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <div {...styles.slot3} />
        <div {...styles.slot4} />
      </div>

      <Container size="xl" {...styles.slot5}>
        {children}
      </Container>
    </div>
  );
}
