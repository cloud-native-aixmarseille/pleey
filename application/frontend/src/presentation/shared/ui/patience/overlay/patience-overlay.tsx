import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { usePatienceDelay } from '../hooks/use-patience-delay';
import { usePatiencePlayground } from '../playground/patience-playground-context';
import { PATIENCE_ANIMATIONS } from '../registry';
import { PatienceAnimationId } from '../types';

const overlayStyle = {
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'fixed',
  zIndex: 60,
} as const;

const srOnlyStyle = {
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
} as const;

interface PatienceOverlayProps {
  readonly active?: boolean;
  readonly delayMs?: number;
  readonly animation?: PatienceAnimationId;
}

export function PatienceOverlay({
  active = true,
  delayMs = 0,
  animation = PatienceAnimationId.LEMMINGS,
}: PatienceOverlayProps) {
  const { t } = usePresentationTranslation();
  const { container } = usePatiencePlayground();
  const show = usePatienceDelay(active, delayMs);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const ariaLabel = useMemo(() => t('common.patience.aria'), [t]);

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
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    const ResizeObserverCtor = window.ResizeObserver;
    const resizeObserver = ResizeObserverCtor ? new ResizeObserverCtor(scheduleUpdate) : null;

    resizeObserver?.observe(container);

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
      resizeObserver?.disconnect();

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [container, show]);

  if (!show || !container) {
    return null;
  }

  const AnimationComponent = PATIENCE_ANIMATIONS[animation];

  return createPortal(
    <div
      aria-hidden={!active}
      style={{
        ...overlayStyle,
        top: containerRect?.top ?? 0,
        left: containerRect?.left ?? 0,
        width: containerRect?.width ?? 0,
        height: containerRect?.height ?? 0,
      }}
    >
      <output aria-live="polite" style={srOnlyStyle}>
        {ariaLabel}
      </output>

      <AnimationComponent container={container} />
    </div>,
    document.body,
  );
}
