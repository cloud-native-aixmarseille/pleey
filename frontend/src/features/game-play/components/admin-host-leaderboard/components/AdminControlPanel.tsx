import { useNavigate } from "react-router-dom";
import { AnimationStage } from "../constants";
import { Button, Card, PrimaryButton } from "../../../../../shared/components";

interface AdminControlPanelProps {
  animationStage: AnimationStage;
}

export function AdminControlPanel({ animationStage }: AdminControlPanelProps) {
  const navigate = useNavigate();

  if (animationStage < 5) {
    return null;
  }

  const handleNavigateAdmin = () => navigate("/admin");
  const handleNavigateHome = () => navigate("/");

  return (
    <div
      className="max-w-2xl mx-auto space-y-6 animate-fade-in"
      style={{ animationDelay: "0.5s" }}
    >
      <Card className="p-8 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border-4 border-accent-500">
        <h3 className="font-display text-2xl sm:text-3xl text-accent-400 uppercase text-center mb-6 tracking-wider">
          👑 Admin Controls
        </h3>
        <div className="space-y-4">
          <Button
            variant="accent"
            size="xl"
            fullWidth
            onClick={handleNavigateAdmin}
            className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider text-xl py-6"
          >
            <span className="flex items-center justify-center gap-4">
              <span className="text-3xl">📊</span>
              <span>BACK TO ADMIN DASHBOARD</span>
            </span>
          </Button>

          <PrimaryButton
            size="xl"
            fullWidth
            onClick={handleNavigateHome}
            className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider text-xl py-6"
          >
            <span className="flex items-center justify-center gap-4">
              <span className="text-3xl">🎮</span>
              <span>NEW GAME</span>
            </span>
          </PrimaryButton>
        </div>
      </Card>

      <div className="text-center pt-6">
        <p className="text-light-400 text-lg sm:text-xl font-body">
          Thanks for hosting! 🎮✨
        </p>
      </div>
    </div>
  );
}
