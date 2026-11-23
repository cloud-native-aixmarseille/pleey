import { Paper } from '@mantine/core';
import QRCode from 'react-qr-code';
import { CopyButton } from '../actions/copy-button';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ContentStack } from '../layout/containers';
import { SupportingText } from '../layout/typography';
import { ExternalTextLink } from '../navigation/links';

const ResolvedQrCode = resolveQrCodeComponent(QRCode) as typeof QRCode;

interface QrShareCardProps {
  readonly href: string;
  readonly scanLabel: string;
  readonly visitLabel: string;
  readonly copyLabel?: string;
}

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

export function QrShareCard({ href, scanLabel, visitLabel, copyLabel }: QrShareCardProps) {
  const displayUrl = stripScheme(href);

  return (
    <ContentStack align="center" gap="xl">
      <ContentStack align="center" gap="sm">
        <Paper bg="#ffffff" display="inline-flex" p="md" radius={uiThemeTokens.radius.inset}>
          <ResolvedQrCode level="M" size={160} value={href} />
        </Paper>
        <SupportingText tone="soft">{scanLabel}</SupportingText>
      </ContentStack>

      <ContentStack align="center" gap="sm">
        <SupportingText>{visitLabel}</SupportingText>
        <ExternalTextLink href={href}>{displayUrl}</ExternalTextLink>
        {copyLabel ? (
          <CopyButton size="sm" textToCopy={href}>
            {copyLabel}
          </CopyButton>
        ) : null}
      </ContentStack>
    </ContentStack>
  );
}
