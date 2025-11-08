import { ReactNode } from "react";
import { Container } from "../../../../../shared/components";
import Confetti from "../../Confetti";

interface LeaderboardLayoutProps {
  showConfetti: boolean;
  children: ReactNode;
}

export function LeaderboardLayout({
  showConfetti,
  children,
}: LeaderboardLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-500 crt-screen p-4 sm:p-8 relative overflow-hidden">
      {showConfetti && <Confetti />}

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
          <span className="text-2xl animate-bounce-slow">👑</span>
          <span className="font-display text-accent-400 uppercase text-base tracking-wider">
            HOST VIEW
          </span>
        </div>
      </div>

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

      <Container size="xl" className="relative z-10 pt-20">
        {children}
      </Container>
    </div>
  );
}
