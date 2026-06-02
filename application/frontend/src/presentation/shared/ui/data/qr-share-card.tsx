import { Anchor, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '../actions/button';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';
import { ContentStack } from '../layout/containers';
import { SupportingText } from '../layout/typography';

const ResolvedQrCode = resolveQrCodeComponent(QRCode) as typeof QRCode;

interface QrShareCardProps {
  readonly copiedLabel?: string;
  readonly copyFailedLabel?: string;
  readonly copyLabel?: string;
  readonly href: string;
  readonly scanLabel: string;
  readonly visitLabel: string;
}

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_STATUS_RESET_DELAY_MS = 2_000;

const qrFrameStyle = {
  background: '#ffffff',
  borderRadius: uiThemeTokens.radius.inset,
  display: 'inline-flex',
  padding: uiThemeTokens.spacing.md,
} as const;

const shareLinkStyle = {
  color: uiThemeTokens.color.brand.accent,
  fontFamily: uiThemeTokens.typography.monoFamily,
  letterSpacing: '0.04em',
  textDecoration: 'none',
  wordBreak: 'break-all',
} as const;

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

function resolveQrCodeComponent(qrCodeModule: unknown): unknown {
  if (typeof qrCodeModule === 'object' && qrCodeModule !== null) {
    if ('default' in qrCodeModule && qrCodeModule.default) {
      return qrCodeModule.default;
    }

    if ('QRCode' in qrCodeModule && qrCodeModule.QRCode) {
      return qrCodeModule.QRCode;
    }
  }

  return qrCodeModule;
}

export function QrShareCard({
  copiedLabel,
  copyFailedLabel,
  copyLabel,
  href,
  scanLabel,
  visitLabel,
}: QrShareCardProps) {
  const displayUrl = stripScheme(href);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (copyState === 'idle') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle');
    }, COPY_STATUS_RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const copyStatusLabel =
    copyState === 'copied' ? copiedLabel : copyState === 'failed' ? copyFailedLabel : null;

  return (
    <ContentStack align="center" gap="xl">
      <ContentStack align="center" gap="sm">
        <Paper style={qrFrameStyle}>
          <ResolvedQrCode level="M" size={160} value={href} />
        </Paper>
        <SupportingText tone="soft">{scanLabel}</SupportingText>
      </ContentStack>

      <ContentStack align="center" gap="sm">
        <SupportingText>{visitLabel}</SupportingText>
        <Anchor href={href} style={shareLinkStyle} target="_blank">
          {displayUrl}
        </Anchor>
        {copyLabel ? (
          <Button
            intent="ghost"
            leftSection={<AppIcon name="copy" size={14} />}
            onClick={() => void handleCopyLink()}
            size="sm"
            type="button"
          >
            {copyLabel}
          </Button>
        ) : null}
        {copyStatusLabel ? <SupportingText tone="soft">{copyStatusLabel}</SupportingText> : null}
      </ContentStack>
    </ContentStack>
  );
}
