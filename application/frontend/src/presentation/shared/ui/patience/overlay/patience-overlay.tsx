import { Box, VisuallyHidden } from '@mantine/core';
import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { usePatienceDelay } from '../hooks/use-patience-delay';
import type { PatienceAnimationRegistry } from '../patience-animation-registry-context';
import { usePatiencePlayground } from '../playground/patience-playground-context';
import { PatienceAnimationId } from '../types';

interface PatienceOverlayProps {
  readonly active?: boolean;
  readonly animations?: PatienceAnimationRegistry;
  readonly currentAnimation?: PatienceAnimationId;
  readonly delayMs?: number;
}

export function PatienceOverlay({
  active = true,
  animations,
  currentAnimation = PatienceAnimationId.LEMMINGS,
  delayMs = 0,
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

  const AnimationComponent = animations?.[currentAnimation];

  if (!AnimationComponent) {
    return null;
  }

  return createPortal(
    <Box
      aria-hidden={!active}
      h={containerRect?.height ?? 0}
      left={containerRect?.left ?? 0}
      pos="fixed"
      style={{ overflow: 'hidden', pointerEvents: 'none', zIndex: 60 }}
      top={containerRect?.top ?? 0}
      w={containerRect?.width ?? 0}
    >
      <VisuallyHidden aria-live="polite" component="output">
        {ariaLabel}
      </VisuallyHidden>

      <AnimationComponent container={container} />
    </Box>,
    document.body,
  );
}
