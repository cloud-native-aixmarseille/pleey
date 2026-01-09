import { useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import type { PatienceAnimationId } from "../types";
import { usePatienceDelay } from "../hooks/usePatienceDelay";
import { usePatiencePlayground } from "../playground/PatiencePlaygroundContext";
import { PATIENCE_ANIMATIONS } from "../registry";

const OVERLAY_CLASSES = "pointer-events-none fixed z-[60] overflow-hidden";
const SR_ONLY_CLASSES = "sr-only";

interface PatienceOverlayProps {
  active?: boolean;
  delayMs?: number;
  animation?: PatienceAnimationId;
}

export function PatienceOverlay({
  active = true,
  delayMs = 0,
  animation = "lemmings",
}: PatienceOverlayProps) {
  const { t } = useTranslation();
  const { container } = usePatiencePlayground();
  const show = usePatienceDelay(active, delayMs);

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const ariaLabel = useMemo(() => t("common.patience.aria"), [t]);

  useLayoutEffect(() => {
    if (!show || !container) {
      return;
    }

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      setContainerRect(container.getBoundingClientRect());
    };

    const scheduleUpdate = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    const ResizeObserverCtor = window.ResizeObserver;
    const resizeObserver = ResizeObserverCtor
      ? new ResizeObserverCtor(() => scheduleUpdate())
      : null;

    resizeObserver?.observe(container);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);

      resizeObserver?.disconnect();

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [container, show]);

  if (!show) {
    return null;
  }

  if (!container) {
    return null;
  }

  const AnimationComponent = PATIENCE_ANIMATIONS[animation];

  return createPortal(
    <div
      className={OVERLAY_CLASSES}
      aria-hidden={!active}
      style={{
        top: containerRect?.top ?? 0,
        left: containerRect?.left ?? 0,
        width: containerRect?.width ?? 0,
        height: containerRect?.height ?? 0,
      }}
    >
      <div className={SR_ONLY_CLASSES} role="status" aria-live="polite">
        {ariaLabel}
      </div>

      <AnimationComponent container={container} />
    </div>,
    document.body
  );
}
