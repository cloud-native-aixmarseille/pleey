import { Group, Paper, Text } from '@mantine/core';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { ContentStack } from '../layout/containers';

interface PinCodePreviewProps {
  readonly ariaLabel: string;
  readonly label: string;
  readonly value: string;
}

const pinLabelStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const pinTileStyle = {
  alignItems: 'center',
  aspectRatio: '3 / 4',
  background: `linear-gradient(180deg, ${uiThemeTokens.color.surface.accentPanel} 0%, ${uiThemeTokens.color.surface.panel} 100%)`,
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.inset,
  boxShadow: `${uiThemeTokens.shadow.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
  color: uiThemeTokens.color.brand.accent,
  display: 'flex',
  flex: '1 1 0',
  justifyContent: 'center',
  minWidth: 0,
} as const;

const pinCharacterStyle = {
  color: uiThemeTokens.color.brand.accent,
  fontFamily: uiThemeTokens.typography.monoFamily,
  fontSize: 'clamp(1.4rem, 3vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '0.05em',
  lineHeight: 1,
  textShadow: `0 0 12px ${uiThemeTokens.color.brand.accent}`,
} as const;

export function PinCodePreview({ ariaLabel, label, value }: PinCodePreviewProps) {
  return (
    <ContentStack align="center" gap="sm">
      <Text component="p" style={pinLabelStyle}>
        {label}
      </Text>
      <Group aria-label={ariaLabel} gap="xs" grow role="img" w="100%" wrap="nowrap">
        {Array.from(value).map((character, index) => (
          <Paper key={`${index}-${character}`} p="xs" style={pinTileStyle}>
            <Text component="span" style={pinCharacterStyle}>
              {character}
            </Text>
          </Paper>
        ))}
      </Group>
    </ContentStack>
  );
}
