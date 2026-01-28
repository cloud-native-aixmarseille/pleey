import type { PropsWithChildren } from 'react';
import { ContentStack } from './containers';
import { Eyebrow, Heading, SupportingText } from './typography';

interface IntroBlockProps extends PropsWithChildren {
  readonly align?: 'start' | 'center';
  readonly eyebrow?: string;
  readonly eyebrowCompact?: boolean;
  readonly eyebrowTone?: 'accent' | 'success';
  readonly hero?: boolean;
  readonly level?: 1 | 2 | 3;
  readonly subtitle?: string;
  readonly subtitleMarginTop?: 'none' | 'xs' | 'sm' | 'md';
  readonly subtitleMaxWidth?: number | string;
  readonly subtitleSize?: 'sm' | 'md';
  readonly title: string;
}

const centeredIntroStyle = {
  textAlign: 'center',
} as const;

export function IntroBlock({
  align = 'start',
  children,
  eyebrow,
  eyebrowCompact = false,
  eyebrowTone = 'accent',
  hero = false,
  level = 2,
  subtitle,
  subtitleMarginTop = 'none',
  subtitleMaxWidth,
  subtitleSize = 'sm',
  title,
}: IntroBlockProps) {
  const alignItems = align === 'center' ? 'center' : 'stretch';
  const subtitleContainerStyle = subtitleMaxWidth ? { maxWidth: subtitleMaxWidth } : undefined;

  return (
    <div style={align === 'center' ? centeredIntroStyle : undefined}>
      <ContentStack align={alignItems} gap="xs">
        {eyebrow ? (
          <Eyebrow compact={eyebrowCompact} tone={eyebrowTone}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading hero={hero} level={level}>
          {title}
        </Heading>
        {subtitle ? (
          <div style={subtitleContainerStyle}>
            <SupportingText marginTop={subtitleMarginTop} size={subtitleSize}>
              {subtitle}
            </SupportingText>
          </div>
        ) : null}
        {children}
      </ContentStack>
    </div>
  );
}
