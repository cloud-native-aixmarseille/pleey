import { ReactNode } from "react";

import { ArcadePage } from "../../../../../../presentation/shared/ui/components";
import { QuickSettingsMenu } from "../../../../app-shell";

interface RegisterLayoutProps {
  children: ReactNode;
}

export function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <ArcadePage
      variant="gradient"
      padding="md"
      disableVerticalPadding
      contentWidth="sm"
      align="center"
      verticalAlign="center"
      gap="md"
    >
      <QuickSettingsMenu className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6" />
      {children}
    </ArcadePage>
  );
}
