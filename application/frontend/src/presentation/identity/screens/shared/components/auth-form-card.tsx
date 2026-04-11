import type { PropsWithChildren } from 'react';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { IntroBlock } from '../../../../shared/ui/layout/intro-block';
import { AuthFormSurface } from './auth-shell-primitives';

interface AuthFormCardProps extends PropsWithChildren {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
}

export function AuthFormCard({ children, eyebrow, title, subtitle }: AuthFormCardProps) {
  return (
    <AuthFormSurface>
      <ContentStack>
        <IntroBlock eyebrow={eyebrow} subtitle={subtitle} subtitleMarginTop="xs" title={title} />
        {children}
      </ContentStack>
    </AuthFormSurface>
  );
}
