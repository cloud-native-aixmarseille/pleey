import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';
import Confetti from './Confetti';

interface LeaderboardPageProps {
  leaderboard: LeaderboardEntry[];
  onNavigate: (view: string) => void;
}

export default function LeaderboardPage({
  leaderboard,
  onNavigate
}: LeaderboardPageProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    // Cinematic animation sequence
    const timers = [
      setTimeout(() => setAnimationStage(1), 500),   // Show title
      setTimeout(() => setAnimationStage(2), 1500),  // Show 1st place
      setTimeout(() => setAnimationStage(3), 2200),  // Show 2nd place
      setTimeout(() => setAnimationStage(4), 2900),  // Show 3rd place
      setTimeout(() => setAnimationStage(5), 3600),  // Show rest
      setTimeout(() => setShowConfetti(false), 8000) // Stop confetti
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const podiumColors = {
    1: { bg: 'from-accent-400 to-accent-500', height: 'h-56', scale: 'scale-110', glow: 'shadow-neon-accent' },
    2: { bg: 'from-light-300 to-light-400', height: 'h-44', scale: 'scale-100', glow: 'shadow-glow' },
    3: { bg: 'from-secondary-300 to-secondary-400', height: 'h-32', scale: 'scale-95', glow: 'shadow-neon-secondary' }
  };

  return (
    <div className="min-h-screen bg-dark-500 p-4 sm:p-8 relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && <Confetti />}

      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid bg-grid-size opacity-20"></div>
      
      {/* Pulsing background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none"></div>

      <Container size="lg" className="relative z-10">
        {/* Game Over Title with cinematic entrance */}
        {animationStage >= 1 && (
          <div className="text-center mb-12 animate-scale-in">
            <div className="inline-block relative">
              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-4 animate-glow uppercase tracking-wider">
                GAME OVER
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-secondary-500/20 blur-2xl -z-10 animate-pulse-slow"></div>
            </div>
            <div className="text-7xl sm:text-8xl mb-4 animate-bounce-slow">🏆</div>
            <h2 className="font-display text-3xl sm:text-4xl text-accent-500 mb-2 uppercase animate-glow">
              Final Results
            </h2>
            <p className="text-light-300 text-lg sm:text-xl font-body">
              Congratulations to all players! 🎉
            </p>
          </div>
        )}

        {/* Podium - Revealed in sequence */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-12 items-end max-w-3xl mx-auto">
          {/* 2nd Place */}
          {leaderboard[1] && animationStage >= 3 && (
            <div className={`text-center ${podiumColors[2].scale} transition-all duration-700 transform`}
                 style={{ animation: 'slideUp 0.7s ease-out, scaleIn 0.5s ease-out' }}>
              <Card className={`bg-gradient-to-br from-light-50 to-light-200 border-4 border-light-400 p-4 sm:p-6 mb-2 ${podiumColors[2].glow} hover:scale-105 transition-transform`}>
                <div className="text-5xl sm:text-6xl mb-2 animate-bounce-slow" style={{ animationDelay: '0.3s' }}>🥈</div>
                <div className="text-lg sm:text-2xl font-black text-dark-800 truncate font-display uppercase">
                  {leaderboard[1].username}
                </div>
                <div className="text-base sm:text-xl font-bold text-dark-600 mt-1 font-body">
                  {leaderboard[1].totalPoints} pts
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[2].bg} ${podiumColors[2].height} rounded-2xl flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform`}>
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg font-display">2</span>
              </div>
            </div>
          )}

          {/* 1st Place - Winner entrance with extra flair */}
          {leaderboard[0] && animationStage >= 2 && (
            <div className={`text-center ${podiumColors[1].scale} transition-all duration-700 transform`}
                 style={{ animation: 'slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s' }}>
              <Card className={`bg-gradient-to-br from-accent-200 to-accent-400 border-4 border-accent-500 p-6 sm:p-8 mb-2 shadow-neon-accent hover:scale-110 transition-all relative overflow-hidden`}>
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float" style={{ animationDuration: '2s' }}></div>
                <div className="relative z-10">
                  <div className="text-7xl sm:text-8xl mb-2 animate-bounce-slow">👑</div>
                  <div className="text-2xl sm:text-3xl font-black text-dark-900 truncate font-display uppercase animate-glow">
                    {leaderboard[0].username}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-dark-800 mt-2 font-body">
                    🎯 {leaderboard[0].totalPoints} pts
                  </div>
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[1].bg} ${podiumColors[1].height} rounded-2xl flex items-center justify-center shadow-neon-accent transform hover:scale-105 transition-transform relative overflow-hidden`}>
                <div className="absolute inset-0 animate-pulse-slow bg-white/10"></div>
                <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-lg font-display relative z-10">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && animationStage >= 4 && (
            <div className={`text-center ${podiumColors[3].scale} transition-all duration-700 transform`}
                 style={{ animation: 'slideUp 0.7s ease-out, scaleIn 0.5s ease-out' }}>
              <Card className={`bg-gradient-to-br from-secondary-100 to-secondary-300 border-4 border-secondary-400 p-4 sm:p-6 mb-2 ${podiumColors[3].glow} hover:scale-105 transition-transform`}>
                <div className="text-5xl sm:text-6xl mb-2 animate-bounce-slow" style={{ animationDelay: '0.6s' }}>🥉</div>
                <div className="text-lg sm:text-2xl font-black text-dark-800 truncate font-display uppercase">
                  {leaderboard[2].username}
                </div>
                <div className="text-base sm:text-xl font-bold text-dark-600 mt-1 font-body">
                  {leaderboard[2].totalPoints} pts
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[3].bg} ${podiumColors[3].height} rounded-2xl flex items-center justify-center shadow-neon-secondary transform hover:scale-105 transition-transform`}>
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg font-display">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Rest of rankings with staggered reveal */}
        {leaderboard.slice(3).length > 0 && animationStage >= 5 && (
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center font-display uppercase">
              Other Players
            </h3>
            <div className="space-y-3">
              {leaderboard.slice(3).map((player, index) => (
                <Card 
                  key={index} 
                  className="p-4 sm:p-6 flex justify-between items-center hover:scale-105 transition-transform hover:border-primary-500"
                  style={{ 
                    animation: 'slideUp 0.4s ease-out',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <span className="text-2xl sm:text-3xl font-black text-light-600 flex-shrink-0 font-display">
                      #{index + 4}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-light-100 truncate font-body">
                      {player.username}
                    </span>
                  </div>
                  <div className="glass-effect rounded-xl px-3 sm:px-4 py-2 flex-shrink-0 border border-primary-500/30">
                    <span className="text-lg sm:text-xl font-black text-primary-400 font-body">
                      {player.totalPoints} pts
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons with share functionality */}
        {animationStage >= 5 && (
          <div className="max-w-md mx-auto space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Button
              variant="accent"
              size="xl"
              fullWidth
              onClick={() => onNavigate('home')}
              className="retro-shadow hover:translate-x-1 hover:translate-y-1 font-display uppercase tracking-wider"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">▶</span>
                <span>Play Again</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => {
                // Share/screenshot functionality
                if (navigator.share) {
                  navigator.share({
                    title: 'QuizMaster Results',
                    text: `I scored ${leaderboard.find(p => p.username)?.totalPoints || 0} points! 🏆`,
                  }).catch(() => {});
                }
              }}
              className="font-display uppercase tracking-wider"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share Results</span>
              </span>
            </Button>
            <div className="text-center pt-4">
              <p className="text-light-400 text-sm font-body">
                Thanks for playing! 🎮✨
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
