import { type ReactNode } from "react";
import { ArcadePage, Container } from "../../../../../shared/components";

const GLOW_OVERLAY_WRAPPER_CLASSES =
  "absolute inset-0 pointer-events-none overflow-hidden";
const PRIMARY_GLOW_CLASSES =
  "absolute -top-10 left-12 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow";
const ACCENT_GLOW_CLASSES =
  "absolute bottom-10 right-12 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl animate-pulse-slow animation-delay-200";

interface PlayingLayoutProps {
  children: ReactNode;
}

export function PlayingLayout({ children }: PlayingLayoutProps) {
  return (
    <div className="crt-screen">
      <ArcadePage
        variant="gradient"
        padding="lg"
        contentWidth="xl"
        gap="lg"
        verticalAlign="start"
        overlays={
          <div className={GLOW_OVERLAY_WRAPPER_CLASSES}>
            <div className={PRIMARY_GLOW_CLASSES} />
            <div className={ACCENT_GLOW_CLASSES} />
          </div>
        }
      >
        <Container size="xl" center>
          {children}
        </Container>
      </ArcadePage>
    </div>
  );
}
