import type { ReactNode } from 'react';
import { ContentStack } from '../layout/containers';
import { StatusBanner } from './status-banner';

interface StatusBannerGroupProps {
  readonly error?: ReactNode;
  readonly success?: ReactNode;
  readonly info?: ReactNode;
  readonly warning?: ReactNode;
  readonly live?: ReactNode;
}

export function StatusBannerGroup({ error, success, info, warning, live }: StatusBannerGroupProps) {
  if (!error && !success && !info && !warning && !live) {
    return null;
  }

  return (
    <ContentStack gap="xs">
      <StatusBanner tone="error">{error}</StatusBanner>
      <StatusBanner tone="success">{success}</StatusBanner>
      <StatusBanner tone="info">{info}</StatusBanner>
      <StatusBanner tone="warning">{warning}</StatusBanner>
      <StatusBanner tone="live">{live}</StatusBanner>
    </ContentStack>
  );
}
