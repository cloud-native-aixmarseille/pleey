import { Player } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';

interface LobbyPageProps {
  gamePin: string;
  players: Player[];
  isAdmin: boolean;
  onStartGame: () => void;
}

export default function LobbyPage({
  gamePin,
  players,
  isAdmin,
  onStartGame
}: LobbyPageProps) {
  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <Container size="lg" className="relative z-10">
        <div className="text-center">
          {/* PIN Card */}
          <Card className="p-8 sm:p-12 mb-8 animate-scale-in">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon mb-2">
                Code PIN du jeu
              </h2>
              <p className="text-light-700">Partagez ce code pour inviter des joueurs</p>
            </div>
            
            {/* PIN Display */}
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-1 inline-block">
                <div className="bg-white rounded-3xl px-8 sm:px-12 py-6">
                  <div className="text-5xl sm:text-7xl font-black text-dark-900 tracking-widest">
                    {gamePin}
                  </div>
                </div>
              </div>
            </div>

            {/* Player Count */}
            <div className="glass-effect rounded-2xl px-6 py-4 inline-flex items-center gap-3 mb-8">
              <span className="text-4xl animate-pulse">👥</span>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black text-dark-800">
                  {players.length}
                </div>
                <div className="text-sm text-light-700">
                  joueur{players.length > 1 ? 's' : ''} connecté{players.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Start Button */}
            {isAdmin && (
              <Button
                variant="success"
                size="xl"
                onClick={onStartGame}
                disabled={players.length < 1}
                icon={
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                }
              >
                Démarrer la partie
              </Button>
            )}

            {!isAdmin && (
              <div className="glass-effect rounded-2xl px-6 py-3 inline-block">
                <p className="text-primary-600 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                  En attente du démarrage...
                </p>
              </div>
            )}
          </Card>

          {/* Players Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
              <span>Joueurs connectés</span>
              <span className="glass-effect rounded-full px-3 py-1 text-lg">
                {players.length}
              </span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {players.map((player, index) => (
                <Card
                  key={index}
                  hover
                  className={`p-6 text-center animate-scale-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-5xl mb-3 animate-bounce-slow">
                    {['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐷', '🐵', '🐶'][index % 10]}
                  </div>
                  <div className="font-bold text-dark-800 truncate text-sm">
                    {player.username}
                  </div>
                  <div className="mt-2 inline-block px-2 py-1 bg-success-100 text-success-700 rounded-lg text-xs font-bold">
                    Prêt
                  </div>
                </Card>
              ))}
              
              {/* Empty slots for visual effect */}
              {players.length < 8 && [...Array(Math.min(3, 8 - players.length))].map((_, i) => (
                <Card
                  key={`empty-${i}`}
                  className="p-6 text-center opacity-30"
                >
                  <div className="text-5xl mb-3">👤</div>
                  <div className="text-sm text-light-600">En attente...</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
