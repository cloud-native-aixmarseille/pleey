import { Button, Card, Container } from '../../../shared/components';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <Card className="p-10 sm:p-12 text-center animate-scale-in">
          {/* Logo/Title with gradient text and glow effect */}
          <div className="mb-8">
            <div className="text-7xl sm:text-8xl mb-4 animate-bounce-slow">🎮</div>
            <h1 className="text-5xl sm:text-6xl font-black mb-3 text-gradient-neon drop-shadow-lg">
              QuizMaster
            </h1>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full border border-primary-500/30 backdrop-blur-sm">
              <p className="text-primary-400 font-bold text-sm sm:text-base">
                ⚡ Apprenez en vous amusant ! ⚡
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-effect rounded-2xl p-3 hover:bg-white/20 transition-all">
              <div className="text-2xl mb-1">🚀</div>
              <p className="text-xs font-semibold text-light-300">Rapide</p>
            </div>
            <div className="glass-effect rounded-2xl p-3 hover:bg-white/20 transition-all">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-xs font-semibold text-light-300">Fun</p>
            </div>
            <div className="glass-effect rounded-2xl p-3 hover:bg-white/20 transition-all">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-xs font-semibold text-light-300">Compétitif</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onNavigate('login')}
            >
              <span className="flex items-center justify-center gap-2">
                <span>Se connecter</span>
                <span className="text-2xl">→</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => onNavigate('register')}
            >
              <span className="flex items-center justify-center gap-2">
                <span>S'inscrire</span>
                <span className="text-2xl">✨</span>
              </span>
            </Button>
          </div>

          {/* Footer tagline */}
          <p className="mt-8 text-light-600 text-sm">
            Rejoignez des milliers de joueurs passionnés
          </p>
        </Card>
      </Container>
    </div>
  );
}
