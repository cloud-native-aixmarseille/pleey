import type { PropsWithChildren } from 'react';
import { authFormCardStyle } from '../../../../shared/ui/foundation/ui-theme';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { IntroBlock } from '../../../../shared/ui/layout/intro-block';

interface AuthFormCardProps extends PropsWithChildren {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
}

export function AuthFormCard({ children, eyebrow, title, subtitle }: AuthFormCardProps) {
  return (
    <div style={authFormCardStyle}>
      <ContentStack>
        <IntroBlock eyebrow={eyebrow} subtitle={subtitle} subtitleMarginTop="xs" title={title} />
        {children}
      </ContentStack>
    </div>
  );
}
