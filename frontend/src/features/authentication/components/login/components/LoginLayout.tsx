import { ReactNode } from "react";

import LanguageSwitcher from "../../../../../shared/components/LanguageSwitcher";

interface LoginLayoutProps {
  children: ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <LanguageSwitcher />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float animation-delay-300" />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
