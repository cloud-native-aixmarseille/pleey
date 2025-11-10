import { AnimationStage } from "../constants";
import { Button, Card, PrimaryButton } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("AdminControlPanel", {
  slot1: "max-w-2xl mx-auto space-y-6 animate-fade-in",
  slot2: "p-8 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border-4 border-accent-500",
  slot3: "font-display text-2xl sm:text-3xl text-accent-400 uppercase text-center mb-6 tracking-wider",
  slot4: "space-y-4",
  slot5: "flex items-center justify-center gap-4",
  slot6: "text-3xl",
  slot7: "text-center pt-6",
  slot8: "text-light-400 text-lg sm:text-xl font-body",
});


interface AdminControlPanelProps {
  animationStage: AnimationStage;
}

export function AdminControlPanel({ animationStage }: AdminControlPanelProps) {
  if (animationStage < 5) {
    return null;
  }

  const handleNavigateAdmin = () => {
    // Force full page reload to clear all state
    window.location.href = "/admin";
  };

  const handleNavigateHome = () => {
    console.log("Navigating to home...");
    // Force full page reload to clear all state
    window.location.href = "/";
  };

  return (
    <div
      {...styles.slot1}
      style={{ animationDelay: "0.5s" }}
    >
      <Card {...styles.slot2}>
        <h3 {...styles.slot3}>
          👑 Admin Controls
        </h3>
        <div {...styles.slot4}>
          <Button
            variant="accent"
            size="xl"
            fullWidth
            effect="retro"
            onClick={handleNavigateAdmin}
          >
            <span {...styles.slot5}>
              <span {...styles.slot6}>📊</span>
              <span>BACK TO ADMIN DASHBOARD</span>
            </span>
          </Button>

          <PrimaryButton
            size="xl"
            fullWidth
            effect="retro"
            onClick={handleNavigateHome}
          >
            <span {...styles.slot5}>
              <span {...styles.slot6}>🎮</span>
              <span>NEW GAME</span>
            </span>
          </PrimaryButton>
        </div>
      </Card>

      <div {...styles.slot7}>
        <p {...styles.slot8}>
          Thanks for hosting! 🎮✨
        </p>
      </div>
    </div>
  );
}
