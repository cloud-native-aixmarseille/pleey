import { ReactNode } from "react";

import { ArcadePage } from "../../../../../shared/components";
import LanguageSwitcher from "../../../../../shared/components/LanguageSwitcher";

interface LoginLayoutProps {
  children: ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <ArcadePage
      variant="gradient"
      padding="md"
      contentWidth="sm"
      align="center"
      verticalAlign="center"
      gap="md"
    >
      <LanguageSwitcher />
      {children}
    </ArcadePage>
  );
}
