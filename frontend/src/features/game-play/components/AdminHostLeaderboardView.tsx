import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeaderboardEntry } from "../../../shared/types";
import { Button, Card, Container } from "../../../shared/components";
import Confetti from "./Confetti";

interface AdminHostLeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
}

export default function AdminHostLeaderboardView({ 
  leaderboard 
}: AdminHostLeaderboardViewProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Cinematic animation sequence for screen sharing
    const timers = [
      setTimeout(() => setAnimationStage(1), 500), // Show title
      setTimeout(() => setAnimationStage(2), 1500), // Show 1st place
      setTimeout(() => setAnimationStage(3), 2500), // Show 2nd place
      setTimeout(() => setAnimationStage(4), 3500), // Show 3rd place
      setTimeout(() => setAnimationStage(5), 4500), // Show rest
      setTimeout(() => setShowConfetti(false), 10000), // Stop confetti
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const podiumColors = {
    1: {
      bg: "from-accent-500 to-accent-600",
      height: "h-72",
      scale: "scale-110",
      glow: "shadow-neon-accent",
    },
    2: {
      bg: "from-light-400 to-light-500",
      height: "h-56",
      scale: "scale-100",
      glow: "shadow-glow",
    },
    3: {
      bg: "from-secondary-400 to-secondary-500",
      height: "h-40",
      scale: "scale-95",
      glow: "shadow-neon-secondary",
    },
  };

  return (
    <div className="min-h-screen bg-dark-500 crt-screen p-4 sm:p-8 relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && <Confetti />}

      {/* Admin Host Badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
          <span className="text-2xl animate-bounce-slow">👑</span>
          <span className="font-display text-accent-400 uppercase text-base tracking-wider">
            HOST VIEW
          </span>
        </div>
      </div>

      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid bg-grid-size opacity-20"></div>

      {/* Pulsing background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none"></div>

      <Container size="xl" className="relative z-10 pt-20">
        {/* Game Over Title with cinematic entrance */}
        {animationStage >= 1 && (
          <div className="text-center mb-16 animate-scale-in">
            <div className="inline-block relative">
              <h1 className="font-display text-7xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-6 animate-glow uppercase tracking-wider">
                GAME OVER
              </h1>
              <div className="absolute -inset-8 bg-gradient-to-r from-accent-500/30 via-primary-500/30 to-secondary-500/30 blur-3xl -z-10 animate-pulse-slow"></div>
            </div>
            <div className="text-8xl sm:text-9xl mb-6 animate-bounce-slow">
              🏆
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-accent-500 mb-4 uppercase animate-glow">
              Final Leaderboard
            </h2>
            <p className="text-light-300 text-xl sm:text-2xl md:text-3xl font-body">
              Congratulations to all players! 🎉
            </p>
          </div>
        )}

        {/* Enhanced Podium - Larger for screen sharing */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-16 items-end max-w-5xl mx-auto">
          {/* 2nd Place */}
          {leaderboard[1] && animationStage >= 3 && (
            <div
              className={`text-center ${podiumColors[2].scale} transition-all duration-700 transform`}
              style={{
                animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out",
              }}
            >
              <Card
                className={`bg-gradient-to-br from-light-100 to-light-300 border-4 border-light-500 p-6 sm:p-8 mb-3 ${podiumColors[2].glow} hover:scale-105 transition-transform`}
              >
                <div
                  className="text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow"
                  style={{ animationDelay: "0.3s" }}
                >
                  🥈
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase">
                  {leaderboard[1].username}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body">
                  {leaderboard[1].totalPoints} pts
                </div>
              </Card>
              <div
                className={`bg-gradient-to-b ${podiumColors[2].bg} ${podiumColors[2].height} rounded-2xl flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform`}
              >
                <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display">
                  2
                </span>
              </div>
            </div>
          )}

          {/* 1st Place - Winner with extra prominence */}
          {leaderboard[0] && animationStage >= 2 && (
            <div
              className={`text-center ${podiumColors[1].scale} transition-all duration-700 transform`}
              style={{
                animation:
                  "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
              }}
            >
              <Card
                className={`bg-gradient-to-br from-accent-300 to-accent-500 border-4 border-accent-600 p-8 sm:p-10 mb-3 shadow-neon-accent hover:scale-110 transition-all relative overflow-hidden`}
              >
                {/* Animated shine effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="relative z-10">
                  <div className="text-8xl sm:text-9xl md:text-[10rem] mb-3 animate-bounce-slow">
                    👑
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 truncate font-display uppercase animate-glow">
                    {leaderboard[0].username}
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-800 mt-3 font-body">
                    🎯 {leaderboard[0].totalPoints} pts
                  </div>
                </div>
              </Card>
              <div
                className={`bg-gradient-to-b ${podiumColors[1].bg} ${podiumColors[1].height} rounded-2xl flex items-center justify-center shadow-neon-accent transform hover:scale-105 transition-transform relative overflow-hidden`}
              >
                <div className="absolute inset-0 animate-pulse-slow bg-white/10"></div>
                <span className="text-8xl sm:text-9xl md:text-[10rem] font-black text-white drop-shadow-lg font-display relative z-10">
                  1
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && animationStage >= 4 && (
            <div
              className={`text-center ${podiumColors[3].scale} transition-all duration-700 transform`}
              style={{
                animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out",
              }}
            >
              <Card
                className={`bg-gradient-to-br from-secondary-200 to-secondary-400 border-4 border-secondary-500 p-6 sm:p-8 mb-3 ${podiumColors[3].glow} hover:scale-105 transition-transform`}
              >
                <div
                  className="text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow"
                  style={{ animationDelay: "0.6s" }}
                >
                  🥉
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase">
                  {leaderboard[2].username}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body">
                  {leaderboard[2].totalPoints} pts
                </div>
              </Card>
              <div
                className={`bg-gradient-to-b ${podiumColors[3].bg} ${podiumColors[3].height} rounded-2xl flex items-center justify-center shadow-neon-secondary transform hover:scale-105 transition-transform`}
              >
                <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display">
                  3
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rest of rankings - Enhanced visibility */}
        {leaderboard.slice(3).length > 0 && animationStage >= 5 && (
          <div className="max-w-4xl mx-auto mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center font-display uppercase">
              Other Top Players
            </h3>
            <div className="space-y-4">
              {leaderboard.slice(3).map((player, index) => (
                <Card
                  key={index}
                  className="p-6 sm:p-8 flex justify-between items-center hover:scale-105 transition-transform hover:border-primary-500 border-2 border-accent-500/30"
                  style={{
                    animation: "slideUp 0.4s ease-out",
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-light-600 flex-shrink-0 font-display">
                      #{index + 4}
                    </span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-100 truncate font-body">
                      {player.username}
                    </span>
                  </div>
                  <div className="glass-effect rounded-xl px-4 sm:px-6 py-3 flex-shrink-0 border-2 border-primary-500/50">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-400 font-body">
                      {player.totalPoints} pts
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admin Control Panel */}
        {animationStage >= 5 && (
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
                  onClick={() => navigate("/admin")}
                  className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider text-xl py-6"
                >
                  <span className="flex items-center justify-center gap-4">
                    <span className="text-3xl">📊</span>
                    <span>BACK TO ADMIN DASHBOARD</span>
                  </span>
                </Button>
                
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={() => navigate("/")}
                  className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider text-xl py-6"
                >
                  <span className="flex items-center justify-center gap-4">
                    <span className="text-3xl">🎮</span>
                    <span>NEW GAME</span>
                  </span>
                </Button>
              </div>
            </Card>

            <div className="text-center pt-6">
              <p className="text-light-400 text-lg sm:text-xl font-body">
                Thanks for hosting! 🎮✨
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
