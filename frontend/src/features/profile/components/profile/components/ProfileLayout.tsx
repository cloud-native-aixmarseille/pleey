import { ReactNode } from "react";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("ProfileLayout", {
  slot1: "min-h-screen bg-game-gradient p-4 sm:p-8",
});


export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div {...styles.slot1}>{children}</div>
  );
}
