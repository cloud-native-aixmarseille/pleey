import type { PropsWithChildren } from 'react';
import { StatusBannerFrame, type StatusBannerTone } from './status-banner-primitives';

interface StatusBannerProps extends PropsWithChildren {
  readonly tone?: StatusBannerTone;
}

export function StatusBanner({ children, tone = 'info' }: StatusBannerProps) {
  if (!children) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <StatusBannerFrame
      ariaLive={isError ? 'assertive' : 'polite'}
      role={isError ? 'alert' : 'status'}
      tone={tone}
    >
      {children}
    </StatusBannerFrame>
  );
}
