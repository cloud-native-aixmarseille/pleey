import { type ReactNode } from "react";
import { ArcadePage } from "../../../../../../presentation/shared/ui/components";

export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ArcadePage
      variant="gradient"
      padding="lg"
      contentWidth="md"
      gap="lg"
      verticalAlign="start"
    >
      {children}
    </ArcadePage>
  );
}
