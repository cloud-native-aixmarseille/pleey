import { ReactNode } from "react";

import { Container } from "../../../../../shared/components";
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
    <div className="min-h-screen bg-dark-500 p-4 sm:p-8 relative overflow-hidden">
      {showConfetti && <Confetti />}

      <div className="absolute inset-0 bg-grid bg-grid-size opacity-20" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

      <Container size="lg" className="relative z-10">
        {children}
      </Container>
    </div>
  );
}
