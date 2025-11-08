import { ReactNode } from "react";

import LanguageSwitcher from "../../../../../shared/components/LanguageSwitcher";

interface RegisterLayoutProps {
  children: ReactNode;
}

export function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <LanguageSwitcher />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
