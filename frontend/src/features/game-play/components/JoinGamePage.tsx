import { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container } from "../../../shared/components";

interface JoinGamePageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
}

export default function JoinGamePage({
  gamePin,
  onGamePinChange,
  onJoinGame,
}: JoinGamePageProps) {
  const navigate = useNavigate();

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && gamePin.length === 6) {
      onJoinGame();
    }
  };

  return (
    <div className="min-h-screen bg-game-gradient crt-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <div className="animate-slide-up">
          {/* Arcade-style header */}
          <div className="text-center mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-all mb-6 font-mono text-sm hover:scale-105 transform"
            >
              <span className="text-2xl">◄</span>
              <span className="uppercase tracking-wider">BACK TO MENU</span>
            </button>

            {/* Pixel art style icon */}
            <div className="relative inline-block mb-6">
              <div className="text-7xl animate-bounce-slow">🎮</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full animate-pulse"></div>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl uppercase text-neon text-accent-500 mb-3 tracking-wider">
              ► JOIN GAME
            </h1>
            <p className="text-light-300 font-mono text-sm sm:text-base animate-pulse-slow">
              &gt; Enter the PIN code to start playing
            </p>
          </div>

          {/* Main card with arcade styling */}
          <Card className="p-8 sm:p-12 retro-shadow border-4 border-primary-500/50">
            {/* Terminal-style header */}
            <div className="mb-8 pb-4 border-b-2 border-primary-500/30">
              <p className="font-mono text-accent-400 text-xs sm:text-sm">
                <span className="text-success-500 animate-pulse">●</span> SYSTEM
                READY
              </p>
              <p className="font-mono text-primary-300 text-xs mt-1">
                &gt; WAITING FOR INPUT...
              </p>
            </div>

            {/* PIN Input - Arcade style */}
            <div className="mb-8">
              <label className="block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider">
                ► Enter Game PIN ◄
              </label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => onGamePinChange(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="••••••"
                className="w-full p-6 sm:p-8 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-4xl sm:text-6xl font-display tracking-[0.5em] focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 uppercase shadow-neon-accent"
                maxLength={6}
                autoFocus
                aria-label="Game PIN code"
              />
              <div className="flex justify-center items-center gap-3 mt-4">
                <span className="font-mono text-xs text-light-500">
                  PIN LENGTH:
                </span>
                <span
                  className={`font-display text-sm transition-colors ${
                    gamePin.length === 6
                      ? "text-success-500 animate-pulse"
                      : "text-primary-400"
                  }`}
                >
                  {gamePin.length}/6
                </span>
              </div>
            </div>

            {/* Pixel indicators for PIN entry */}
            <div className="flex justify-center gap-3 mb-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-4 h-4 transition-all duration-300 transform
                    ${
                      i < gamePin.length
                        ? "bg-accent-500 shadow-neon-accent scale-125 rotate-45"
                        : "bg-dark-400 border-2 border-primary-500/30"
                    }
                  `}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    animation:
                      i < gamePin.length ? "pixelPop 0.3s ease-out" : "none",
                  }}
                />
              ))}
            </div>

            {/* Join Button - Arcade style with retro shadow */}
            <Button
              variant="accent"
              size="xl"
              fullWidth
              onClick={onJoinGame}
              disabled={gamePin.length !== 6}
              className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="animate-pulse">►</span>
                <span>START GAME</span>
                <span className="animate-pulse">◄</span>
              </span>
            </Button>

            {/* Status message */}
            {gamePin.length === 6 && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="font-mono text-success-500 text-sm animate-pulse">
                  ✓ PIN COMPLETE - PRESS START OR ENTER
                </p>
              </div>
            )}

            {/* Instructions - Terminal style */}
            <div className="mt-8 glass-effect rounded-xl p-5 border-2 border-accent-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <p className="font-display text-accent-400 text-xxs mb-2 uppercase tracking-wider">
                    ► HOW TO JOIN
                  </p>
                  <ul className="font-mono text-xs text-light-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>
                        Ask the game host for the 6-character PIN code
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>
                        The PIN is displayed in large text on the host's screen
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>Enter it above and press START GAME to join!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Fun footer message */}
          <div className="mt-6 text-center">
            <p className="font-mono text-primary-400 text-xs animate-pulse-slow">
              &gt; GET READY FOR AN EPIC QUIZ BATTLE! &lt;
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
