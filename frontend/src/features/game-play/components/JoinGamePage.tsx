import { Button, Card, Container, Input } from '../../../shared/components';

interface JoinGamePageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
  onNavigate: (view: string) => void;
}

export default function JoinGamePage({
  gamePin,
  onGamePinChange,
  onJoinGame,
  onNavigate
}: JoinGamePageProps) {
  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-white hover:text-secondary-400 transition-colors mb-4"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">Retour</span>
            </button>
            <div className="text-6xl mb-4 animate-bounce-slow">🎮</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
              Rejoindre une partie
            </h2>
            <p className="text-light-400">
              Entrez le code PIN partagé par l'hôte
            </p>
          </div>

          <Card className="p-8 sm:p-10">
            {/* PIN Input */}
            <div className="mb-8">
              <label className="block text-dark-800 font-bold text-lg mb-4 text-center">
                Code PIN
              </label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => onGamePinChange(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                className="w-full p-6 border-4 border-primary-300 rounded-2xl text-center text-5xl font-black tracking-widest focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:outline-none transition-all bg-gradient-to-br from-light-50 to-white"
                maxLength={6}
              />
              <p className="text-sm text-light-600 text-center mt-3">
                Le code PIN contient 6 caractères
              </p>
            </div>

            {/* Visual feedback for PIN entry */}
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${i < gamePin.length 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 scale-125' 
                      : 'bg-light-300'}
                  `}
                />
              ))}
            </div>

            {/* Join Button */}
            <Button
              variant="secondary"
              size="xl"
              fullWidth
              onClick={onJoinGame}
              disabled={gamePin.length !== 6}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Rejoindre maintenant</span>
              </span>
            </Button>

            {/* Info box */}
            <div className="mt-8 glass-effect rounded-2xl p-4 border border-primary-200/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm text-dark-700 font-medium">
                    <strong>Astuce :</strong> Demandez le code PIN à l'organisateur de la partie. 
                    Il s'affiche en grand sur son écran !
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
