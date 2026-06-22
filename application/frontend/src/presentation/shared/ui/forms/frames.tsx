import { Box, Stack, Text } from '@mantine/core';
import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface FormRootProps extends Omit<ComponentPropsWithoutRef<'form'>, 'className' | 'style'> {
  readonly children: ReactNode;
}

interface FormSectionFrameProps extends PropsWithChildren {
  readonly legend: string;
  readonly description?: string;
  readonly descriptionId?: string;
}

export function FormRoot({ children, ...props }: FormRootProps) {
  return (
    <Box component="form" {...props}>
      <Stack gap="lg">{children}</Stack>
    </Box>
  );
}

export function FormSectionFrame({
  children,
  description,
  descriptionId,
  legend,
}: FormSectionFrameProps) {
  return (
    <Box aria-describedby={descriptionId} component="fieldset" m={0} p={0} style={{ border: 0 }}>
      <Text
        c={uiThemeTokens.color.text.emphasis}
        component="legend"
        ff={uiTypeScale.cardTitle.fontFamily}
        fz={uiTypeScale.cardTitle.fontSize}
        fw={uiTypeScale.cardTitle.fontWeight}
        lh={uiTypeScale.cardTitle.lineHeight}
        lts={uiTypeScale.cardTitle.letterSpacing}
        p={0}
      >
        {legend}
      </Text>
      <Stack gap="md">
        {description ? (
          <Text
            c={uiThemeTokens.color.text.quiet}
            component="p"
            fz={uiTypeScale.caption.fontSize}
            fw={uiTypeScale.caption.fontWeight}
            id={descriptionId}
            lh={uiTypeScale.caption.lineHeight}
            lts={uiTypeScale.caption.letterSpacing}
            m={0}
          >
            {description}
          </Text>
        ) : null}
        {children}
      </Stack>
    </Box>
  );
}
