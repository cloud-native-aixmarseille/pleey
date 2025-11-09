import { ReactNode } from "react";

import { ArcadePage } from "../../../../../shared/components";
import Confetti from "../../Confetti";

interface LeaderboardLayoutProps {
  children: ReactNode;
  showConfetti: boolean;
}

export function LeaderboardLayout({
  children,
  showConfetti,
}: LeaderboardLayoutProps) {
  return (
    <ArcadePage
      variant="dark"
      padding="md"
      contentWidth="lg"
      gap="md"
      align="start"
      overlays={showConfetti ? <Confetti /> : undefined}
    >
      {children}
    </ArcadePage>
  );
}
