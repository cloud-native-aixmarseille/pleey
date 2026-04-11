import { Alert } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import {
  createStatusBannerStyles,
  StatusBannerIcon,
  type StatusBannerTone,
} from './status-banner-primitives';

interface StatusBannerProps extends PropsWithChildren {
  readonly tone?: StatusBannerTone;
}

export function StatusBanner({ children, tone = 'info' }: StatusBannerProps) {
  if (!children) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <Alert
      aria-live={isError ? 'assertive' : 'polite'}
      icon={<StatusBannerIcon tone={tone} />}
      role={isError ? 'alert' : 'status'}
      styles={createStatusBannerStyles(tone)}
      variant="light"
    >
      {children}
    </Alert>
  );
}
