import { ReactNode } from "react";
import { Container } from "../../../../../shared/components";

interface JoinGameLayoutProps {
  children: ReactNode;
}

export function JoinGameLayout({ children }: JoinGameLayoutProps) {
  return (
    <div className="min-h-screen bg-game-gradient crt-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <Container size="sm" className="relative z-10">
        <div className="animate-slide-up">{children}</div>
      </Container>
    </div>
  );
}
