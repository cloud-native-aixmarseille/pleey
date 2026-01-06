import { ReactNode } from "react";
import { ArcadePage } from "../../../../../../presentation/shared/ui/components";

const CRT_WRAPPER_CLASSES = "crt-screen";
const CONTENT_WRAPPER_CLASSES = "animate-slide-up";

const OVERLAYS = (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute top-20 left-20 h-72 w-72 animate-float rounded-full bg-secondary-500/10 blur-3xl" />
    <div className="absolute bottom-20 right-20 h-96 w-96 animate-float rounded-full bg-primary-500/10 blur-3xl animation-delay-200" />
    <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/5 blur-3xl animate-pulse-slow" />
  </div>
);

interface JoinGameLayoutProps {
  children: ReactNode;
}

export function JoinGameLayout({ children }: JoinGameLayoutProps) {
  return (
    <div className={CRT_WRAPPER_CLASSES} data-join-game-layout="true">
      <ArcadePage
        variant="gradient"
        padding="sm"
        contentWidth="md"
        gap="md"
        verticalAlign="center"
        overlays={OVERLAYS}
      >
        <div className={CONTENT_WRAPPER_CLASSES}>{children}</div>
      </ArcadePage>
    </div>
  );
}
