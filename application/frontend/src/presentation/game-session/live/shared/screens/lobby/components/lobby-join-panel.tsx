import { Anchor, Paper, Stack, Text } from '@mantine/core';
import QRCode from 'react-qr-code';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';

interface LobbyJoinPanelProps {
  readonly sessionPin: string;
  readonly joinUrl: string;
}

const panelStyle = {
  ...surfaceRecipes.hero,
  padding: uiThemeTokens.spacing.xxl,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: uiThemeTokens.spacing.xl,
  textAlign: 'center',
} as const;

const headingStyle = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const pinContainerStyle = {
  display: 'flex',
  gap: 'clamp(0.25rem, 1vw, 0.75rem)',
  justifyContent: 'center',
  flexWrap: 'nowrap',
} as const;

const pinCharStyle = {
  alignItems: 'center',
  aspectRatio: '3 / 4',
  background: `linear-gradient(180deg, ${uiThemeTokens.color.surface.accentPanel} 0%, ${uiThemeTokens.color.surface.panel} 100%)`,
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.inset,
  boxShadow: `${uiThemeTokens.shadow.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
  color: uiThemeTokens.color.brand.accent,
  display: 'flex',
  flex: '1 1 0',
  fontFamily: uiThemeTokens.typography.monoFamily,
  fontSize: 'clamp(1.6rem, 3.5vw, 4rem)',
  fontWeight: 800,
  justifyContent: 'center',
  letterSpacing: '0.05em',
  minWidth: 0,
  textShadow: `0 0 12px ${uiThemeTokens.color.brand.accent}`,
  transition: `${uiThemeTokens.motion.quick} box-shadow`,
} as const;

const qrWrapperStyle = {
  background: '#ffffff',
  borderRadius: uiThemeTokens.radius.inset,
  padding: uiThemeTokens.spacing.md,
  display: 'inline-flex',
} as const;

const urlLabelStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const urlStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.brand.accent,
  fontFamily: uiThemeTokens.typography.monoFamily,
  letterSpacing: '0.04em',
  margin: 0,
  wordBreak: 'break-all',
} as const;

const scanLabelStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
} as const;

export function LobbyJoinPanel({ sessionPin, joinUrl }: LobbyJoinPanelProps) {
  const { t } = usePresentationTranslation();
  const displayUrl = joinUrl.replace(/^https?:\/\//, '');

  return (
    <Paper component="section" style={panelStyle} aria-label={t('game.lobby.joinPanelLabel')}>
      <Text component="h2" style={headingStyle}>
        {t('game.lobby.joinHeading')}
      </Text>

      <Stack align="center" gap="lg">
        <div style={qrWrapperStyle}>
          <QRCode value={joinUrl} size={160} level="M" />
        </div>
        <Text component="p" style={scanLabelStyle}>
          {t('game.lobby.scanToJoin')}
        </Text>
      </Stack>

      <Stack align="center" gap="xs">
        <Text component="p" style={urlLabelStyle}>
          {t('game.lobby.orVisit')}
        </Text>
        <Anchor href={joinUrl} style={urlStyle}>
          {displayUrl}
        </Anchor>
      </Stack>

      <Stack align="center" gap="xs" style={{ width: '100%' }}>
        <Text component="p" style={urlLabelStyle}>
          {t('game.lobby.enterCode')}
        </Text>
        <div style={pinContainerStyle} role="img" aria-label={`PIN: ${sessionPin}`}>
          {sessionPin.split('').map((char, index) => (
            <div key={`${index}-${char}`} style={pinCharStyle}>
              {char}
            </div>
          ))}
        </div>
      </Stack>
    </Paper>
  );
}
