import { LeaderboardEntry } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';

interface LeaderboardPageProps {
  leaderboard: LeaderboardEntry[];
  onNavigate: (view: string) => void;
}

export default function LeaderboardPage({
  leaderboard,
  onNavigate
}: LeaderboardPageProps) {
  const podiumColors = {
    1: { bg: 'from-accent-400 to-accent-500', height: 'h-56', scale: 'scale-110' },
    2: { bg: 'from-light-300 to-light-400', height: 'h-44', scale: 'scale-100' },
    3: { bg: 'from-secondary-300 to-secondary-400', height: 'h-32', scale: 'scale-95' }
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
      </div>

      <Container size="lg" className="relative z-10">
        {/* Title */}
        <div className="text-center mb-12 animate-slide-down">
          <div className="text-8xl mb-4 animate-bounce-slow">🏆</div>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-2 drop-shadow-lg">
            CLASSEMENT FINAL
          </h2>
          <p className="text-light-300 text-xl">
            Bravo à tous les participants !
          </p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-12 items-end max-w-3xl mx-auto">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className={`text-center animate-scale-in animation-delay-100 ${podiumColors[2].scale}`}>
              <Card className="bg-gradient-to-br from-light-100 to-light-200 border-4 border-light-300 p-4 sm:p-6 mb-2">
                <div className="text-5xl sm:text-6xl mb-2 animate-bounce-slow animation-delay-100">🥈</div>
                <div className="text-lg sm:text-2xl font-black text-dark-800 truncate">
                  {leaderboard[1].username}
                </div>
                <div className="text-base sm:text-xl font-bold text-dark-600 mt-1">
                  {leaderboard[1].totalPoints} pts
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[2].bg} ${podiumColors[2].height} rounded-2xl flex items-center justify-center shadow-float`}>
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg">2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <div className={`text-center animate-scale-in ${podiumColors[1].scale}`}>
              <Card className="bg-gradient-to-br from-accent-200 to-accent-300 border-4 border-accent-400 p-6 sm:p-8 mb-2 shadow-glow-lg">
                <div className="text-7xl sm:text-8xl mb-2 animate-bounce-slow">👑</div>
                <div className="text-2xl sm:text-3xl font-black text-dark-900 truncate">
                  {leaderboard[0].username}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-dark-700 mt-2">
                  {leaderboard[0].totalPoints} pts
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[1].bg} ${podiumColors[1].height} rounded-2xl flex items-center justify-center shadow-glow`}>
                <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-lg">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className={`text-center animate-scale-in animation-delay-200 ${podiumColors[3].scale}`}>
              <Card className="bg-gradient-to-br from-secondary-100 to-secondary-200 border-4 border-secondary-300 p-4 sm:p-6 mb-2">
                <div className="text-5xl sm:text-6xl mb-2 animate-bounce-slow animation-delay-200">🥉</div>
                <div className="text-lg sm:text-2xl font-black text-dark-800 truncate">
                  {leaderboard[2].username}
                </div>
                <div className="text-base sm:text-xl font-bold text-dark-600 mt-1">
                  {leaderboard[2].totalPoints} pts
                </div>
              </Card>
              <div className={`bg-gradient-to-b ${podiumColors[3].bg} ${podiumColors[3].height} rounded-2xl flex items-center justify-center shadow-float`}>
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Rest of rankings */}
        {leaderboard.slice(3).length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Autres participants
            </h3>
            <div className="space-y-3">
              {leaderboard.slice(3).map((player, index) => (
                <Card 
                  key={index} 
                  className={`p-4 sm:p-6 flex justify-between items-center animate-slide-up`}
                  style={{ animationDelay: `${(index + 3) * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <span className="text-2xl sm:text-3xl font-black text-light-600 flex-shrink-0">
                      #{index + 4}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-dark-800 truncate">
                      {player.username}
                    </span>
                  </div>
                  <div className="glass-effect rounded-xl px-3 sm:px-4 py-2 flex-shrink-0">
                    <span className="text-lg sm:text-xl font-black text-primary-600">
                      {player.totalPoints} pts
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <Button
            variant="accent"
            size="xl"
            fullWidth
            onClick={() => onNavigate('home')}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Nouvelle partie</span>
            </span>
          </Button>
          <div className="text-center">
            <p className="text-light-400 text-sm">
              Merci d'avoir joué ! 🎉
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
