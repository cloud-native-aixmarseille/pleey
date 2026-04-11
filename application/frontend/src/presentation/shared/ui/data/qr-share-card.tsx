import { Anchor, Paper } from '@mantine/core';
import QRCode from 'react-qr-code';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ContentStack } from '../layout/containers';
import { SupportingText } from '../layout/typography';

interface QrShareCardProps {
  readonly href: string;
  readonly scanLabel: string;
  readonly visitLabel: string;
}

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

export function QrShareCard({ href, scanLabel, visitLabel }: QrShareCardProps) {
  const displayUrl = stripScheme(href);

  return (
    <ContentStack align="center" gap="xl">
      <ContentStack align="center" gap="sm">
        <Paper style={qrFrameStyle}>
          <QRCode level="M" size={160} value={href} />
        </Paper>
        <SupportingText tone="soft">{scanLabel}</SupportingText>
      </ContentStack>

      <ContentStack align="center" gap="sm">
        <SupportingText>{visitLabel}</SupportingText>
        <Anchor href={href} style={shareLinkStyle} target="_blank">
          {displayUrl}
        </Anchor>
      </ContentStack>
    </ContentStack>
  );
}
