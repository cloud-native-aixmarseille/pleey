import { ReactNode } from "react";

export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8">{children}</div>
  );
}
