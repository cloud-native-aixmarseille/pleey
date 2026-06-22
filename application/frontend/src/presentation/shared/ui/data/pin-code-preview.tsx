import { Center, Group, Paper, Text } from '@mantine/core';
import { pinCodeCharacterGlowStyle, pinCodeTileStyle, uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { ContentStack } from '../layout/containers';

interface PinCodePreviewProps {
  readonly ariaLabel: string;
  readonly label: string;
  readonly value: string;
}

export function PinCodePreview({ ariaLabel, label, value }: PinCodePreviewProps) {
  return (
    <ContentStack align="center" gap="sm">
      <Text
        c={uiThemeTokens.color.text.soft}
        component="p"
        ff={uiTypeScale.overline.fontFamily}
        fs="normal"
        fz={uiTypeScale.overline.fontSize}
        fw={uiTypeScale.overline.fontWeight}
        lh={uiTypeScale.overline.lineHeight}
        lts={uiTypeScale.overline.letterSpacing}
        m={0}
        tt="uppercase"
      >
        {label}
      </Text>
      <Group aria-label={ariaLabel} gap="xs" grow role="img" w="100%" wrap="nowrap">
        {Array.from(value).map((character, index) => (
          <Paper
            bd={`2px solid ${uiThemeTokens.color.border.accent}`}
            c={uiThemeTokens.color.brand.accent}
            flex="1 1 0"
            key={`${index}-${character}`}
            miw={0}
            p="xs"
            radius={uiThemeTokens.radius.inset}
            style={pinCodeTileStyle}
          >
            <Center h="100%">
              <Text
                c={uiThemeTokens.color.brand.accent}
                component="span"
                ff={uiThemeTokens.typography.monoFamily}
                fz="clamp(1.4rem, 3vw, 3rem)"
                fw={800}
                lh={1}
                lts="0.05em"
                style={pinCodeCharacterGlowStyle}
              >
                {character}
              </Text>
            </Center>
          </Paper>
        ))}
      </Group>
    </ContentStack>
  );
}
