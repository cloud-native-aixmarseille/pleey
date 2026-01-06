import { ReactNode } from "react";

import { ArcadePage } from "../../../../../../presentation/shared/ui/components";

interface PlayingLayoutProps {
  children: ReactNode;
}

const OVERLAY_CONTENT = (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute left-10 top-16 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl animate-float" />
    <div className="absolute bottom-16 right-12 h-96 w-96 rounded-full bg-secondary-500/10 blur-3xl animate-float [animation-delay:250ms]" />
  </div>
);

export function PlayingLayout({ children }: PlayingLayoutProps) {
  return (
    <div className="crt-screen" data-playing-layout="true">
      <ArcadePage
        variant="gradient"
        padding="lg"
        contentWidth="xl"
        gap="lg"
        overlays={OVERLAY_CONTENT}
      >
        {children}
      </ArcadePage>
    </div>
  );
}
