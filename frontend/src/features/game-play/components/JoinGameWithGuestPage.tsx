import { KeyboardEvent, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container } from "../../../shared/components";

interface JoinGameWithGuestPageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
  onJoinAsGuest: (nickname: string) => void;
  isAuthenticated: boolean;
  username?: string;
}

export default function JoinGameWithGuestPage({
  gamePin,
  onGamePinChange,
  onJoinGame,
  onJoinAsGuest,
  isAuthenticated,
  username,
}: JoinGameWithGuestPageProps) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const pinInputId = useId();
  const pinLengthIndicatorId = useId();
  const nicknameInputId = useId();

  const handleKeyPressPin = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && gamePin.length === 6) {
      if (isAuthenticated) {
        onJoinGame();
      } else {
        setShowGuestForm(true);
      }
    }
  };

  const handleKeyPressNickname = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nickname.trim().length > 0) {
      onJoinAsGuest(nickname);
    }
  };

  const handleContinue = () => {
    if (isAuthenticated) {
      onJoinGame();
    } else {
      setShowGuestForm(true);
    }
  };

  const handleGuestJoin = () => {
    if (nickname.trim().length > 0) {
      onJoinAsGuest(nickname);
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
              aria-label="Back to main menu"
            >
              <span className="text-2xl" aria-hidden="true">
                ◄
              </span>
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
              {showGuestForm
                ? "> Enter your nickname to join as guest"
                : "> Enter the PIN code to start playing"}
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
                {isAuthenticated
                  ? `> LOGGED IN AS: ${username}`
                  : showGuestForm
                  ? "> GUEST MODE ACTIVATED"
                  : "> WAITING FOR INPUT..."}
              </p>
            </div>

            {!showGuestForm ? (
              <>
                {/* PIN Input - Arcade style */}
                <div className="mb-8">
                  <label
                    htmlFor={pinInputId}
                    className="block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider"
                  >
                    ► Enter Game PIN ◄
                  </label>
                  <input
                    id={pinInputId}
                    type="text"
                    value={gamePin}
                    onChange={(e) =>
                      onGamePinChange(e.target.value.toUpperCase())
                    }
                    onKeyPress={handleKeyPressPin}
                    placeholder="••••••"
                    className="w-full p-6 sm:p-8 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-4xl sm:text-6xl font-display tracking-[0.5em] focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 uppercase shadow-neon-accent"
                    maxLength={6}
                    aria-describedby={pinLengthIndicatorId}
                  />
                  <div
                    className="flex justify-center items-center gap-3 mt-4"
                    id={pinLengthIndicatorId}
                  >
                    <span className="font-mono text-xs text-light-500">
                      PIN LENGTH:
                    </span>
                    <span
                      className={`font-display text-sm transition-colors ${
                        gamePin.length === 6
                          ? "text-success-500 animate-pulse"
                          : "text-primary-400"
                      }`}
                      aria-live="polite"
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
                          i < gamePin.length
                            ? "pixelPop 0.3s ease-out"
                            : "none",
                      }}
                    />
                  ))}
                </div>

                {/* Continue Button */}
                <Button
                  variant="accent"
                  size="xl"
                  fullWidth
                  onClick={handleContinue}
                  disabled={gamePin.length !== 6}
                  className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all mb-4"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-pulse">►</span>
                    <span>{isAuthenticated ? "JOIN GAME" : "CONTINUE"}</span>
                    <span className="animate-pulse">◄</span>
                  </span>
                </Button>

                {/* Login option for guests */}
                {!isAuthenticated && (
                  <div className="text-center">
                    <p className="font-mono text-xs text-light-400 mb-2">
                      Already have an account?
                    </p>
                    <button
                      onClick={() => navigate("/auth/login")}
                      className="font-mono text-sm text-accent-400 hover:text-accent-300 underline"
                    >
                      Sign in instead
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Guest Nickname Input */}
                <div className="mb-8">
                  <label
                    htmlFor={nicknameInputId}
                    className="block font-display text-primary-300 text-xs sm:text-sm mb-4 text-center uppercase tracking-wider"
                  >
                    ► Choose Your Nickname ◄
                  </label>
                  <input
                    id={nicknameInputId}
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={handleKeyPressNickname}
                    placeholder="Enter nickname..."
                    className="w-full p-4 bg-dark-500 border-4 border-accent-500/50 rounded-xl text-center text-2xl font-display focus:border-accent-500 focus:ring-4 focus:ring-accent-500/30 focus:outline-none transition-all text-accent-400 placeholder-dark-300 shadow-neon-accent"
                    maxLength={20}
                    autoFocus
                  />
                  <p className="text-center font-mono text-xs text-light-500 mt-2">
                    Max 20 characters
                  </p>
                </div>

                {/* Join as Guest Button */}
                <Button
                  variant="accent"
                  size="xl"
                  fullWidth
                  onClick={handleGuestJoin}
                  disabled={nickname.trim().length === 0}
                  className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all mb-4"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-pulse">►</span>
                    <span>JOIN AS GUEST</span>
                    <span className="animate-pulse">◄</span>
                  </span>
                </Button>

                {/* Back button */}
                <button
                  onClick={() => setShowGuestForm(false)}
                  className="w-full font-mono text-sm text-primary-400 hover:text-primary-300 underline"
                >
                  ← Back to PIN entry
                </button>
              </>
            )}

            {/* Status message */}
            {gamePin.length === 6 && !showGuestForm && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="font-mono text-success-500 text-sm animate-pulse">
                  ✓ PIN COMPLETE -{" "}
                  {isAuthenticated ? "PRESS JOIN" : "PRESS CONTINUE"}
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
                        {isAuthenticated
                          ? "Join with your account to save your progress"
                          : "Play as guest (no account needed) or sign in"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-500 flex-shrink-0">•</span>
                      <span>
                        Enter the PIN and{" "}
                        {isAuthenticated
                          ? "press JOIN"
                          : "choose your nickname"}
                        !
                      </span>
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
