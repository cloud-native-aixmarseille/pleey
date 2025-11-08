import { ReactNode } from "react";
import { Container } from "../../../../../shared/components";

interface PlayingLayoutProps {
  children: ReactNode;
}

export function PlayingLayout({ children }: PlayingLayoutProps) {
  return (
    <div className="min-h-screen bg-game-gradient crt-screen p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
      </div>
      <Container size="xl" className="relative z-10">
        {children}
      </Container>
    </div>
  );
}
