import { Player } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';
import { useState, useEffect } from 'react';

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
  const [copiedPin, setCopiedPin] = useState(false);

  const copyPinToClipboard = () => {
    navigator.clipboard.writeText(gamePin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Heartbeat effect for player count
  const [heartbeat, setHeartbeat] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-game-gradient crt-screen p-4 sm:p-6 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Container size="lg" className="relative z-10">
        <div>
          {/* Arcade-style header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase text-neon text-accent-500 mb-2 tracking-wider animate-glow">
              ► GAME LOBBY ◄
            </h1>
            <p className="font-mono text-primary-300 text-xs sm:text-sm animate-pulse-slow">
              &gt; WAITING FOR PLAYERS TO JOIN...
            </p>
          </div>

          {/* Main PIN Display Card - Optimized for screen sharing */}
          <Card className="p-6 sm:p-10 md:p-12 mb-6 sm:mb-8 animate-scale-in retro-shadow border-4 border-accent-500/50">
            {/* Instructions banner */}
            <div className="mb-6 sm:mb-8 glass-effect rounded-xl p-4 sm:p-6 border-2 border-primary-500/30">
              <div className="text-center">
                <p className="font-display text-accent-400 text-xs sm:text-sm uppercase tracking-wider mb-3">
                  ★ HOW TO JOIN THIS GAME ★
                </p>
                <div className="space-y-2">
                  <p className="font-mono text-light-200 text-xs sm:text-sm">
                    <span className="text-accent-500">1.</span> Open the game on your device
                  </p>
                  <p className="font-mono text-light-200 text-xs sm:text-sm">
                    <span className="text-accent-500">2.</span> Click "Join Game" and enter the PIN below
                  </p>
                  <p className="font-mono text-light-200 text-xs sm:text-sm">
                    <span className="text-accent-500">3.</span> Wait for the host to start!
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-primary-300 uppercase text-center tracking-wider mb-2">
                ► ENTER THIS PIN ◄
              </h2>
            </div>
            
            {/* PIN Display - Large and prominent */}
            <div className="relative mb-6 sm:mb-8">
              <div className="bg-dark-500 border-4 border-accent-500 rounded-2xl p-1 inline-block shadow-neon-accent animate-pulse-slow">
                <div className="bg-gradient-to-br from-dark-400 to-dark-500 rounded-xl px-8 sm:px-16 md:px-20 py-6 sm:py-8 md:py-10">
                  <div className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-accent-400 tracking-[0.3em] text-neon">
                    {gamePin}
                  </div>
                </div>
              </div>
              
              {/* Copy PIN button */}
              <button
                onClick={copyPinToClipboard}
                className="mt-4 font-mono text-xs sm:text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2 mx-auto border-2 border-primary-500/30 px-4 py-2 rounded-lg hover:border-primary-500 hover:bg-primary-500/10"
                aria-label="Copy PIN to clipboard"
              >
                {copiedPin ? (
                  <>
                    <span className="text-success-500">✓</span>
                    <span className="text-success-500">COPIED!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>COPY PIN</span>
                  </>
                )}
              </button>
            </div>

            {/* Player Count with Heartbeat */}
            <div className="glass-effect rounded-xl px-6 sm:px-8 py-4 sm:py-5 inline-flex items-center gap-4 mb-6 sm:mb-8 border-2 border-secondary-500/30">
              <span 
                className={`text-4xl sm:text-5xl transition-transform duration-100 ${heartbeat ? 'scale-110' : 'scale-100'}`}
              >
                {players.length > 0 ? '💚' : '🤍'}
              </span>
              <div className="text-left">
                <div className="font-display text-3xl sm:text-4xl text-accent-400 uppercase">
                  {players.length}
                </div>
                <div className="font-mono text-xs sm:text-sm text-light-400 uppercase">
                  Player{players.length !== 1 ? 's' : ''} Ready
                </div>
              </div>
              <div className={`ml-4 ${players.length > 0 ? 'flex' : 'hidden'}`}>
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-success-500"></span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {isAdmin && (
                <Button
                  variant="success"
                  size="xl"
                  fullWidth
                  onClick={onStartGame}
                  disabled={players.length < 1}
                  className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-xl sm:text-2xl">▶</span>
                    <span>START GAME</span>
                    <span className="text-xl sm:text-2xl">◀</span>
                  </span>
                </Button>
              )}

              {!isAdmin && (
                <div className="glass-effect rounded-xl px-6 py-4 border-2 border-primary-500/30 animate-pulse-slow">
                  <p className="font-mono text-primary-400 text-sm sm:text-base flex items-center justify-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                    </span>
                    <span className="uppercase tracking-wider">WAITING FOR HOST TO START...</span>
                  </p>
                </div>
              )}

              {isAdmin && players.length < 1 && (
                <div className="text-center mt-4">
                  <p className="font-mono text-xs text-light-500 animate-pulse">
                    &gt; Need at least 1 player to start the game
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Players Grid */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
              <h3 className="font-display text-base sm:text-xl text-primary-300 uppercase tracking-wider flex items-center gap-2">
                <span>Connected Players</span>
                <span className="glass-effect rounded-full px-3 py-1 text-sm sm:text-lg border-2 border-accent-500/30 text-accent-400">
                  {players.length}
                </span>
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
            </div>
            
            {players.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {players.map((player, index) => (
                  <Card
                    key={index}
                    hover
                    className="p-4 sm:p-6 text-center animate-scale-in border-2 border-accent-500/20 hover:border-accent-500"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="text-4xl sm:text-5xl mb-3 animate-bounce-slow">
                      {['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐷', '🐵', '🐶'][index % 10]}
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-accent-400 truncate font-bold uppercase">
                      {player.username}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 border border-success-500 text-success-400 rounded-lg text-xxs sm:text-xs font-mono uppercase">
                      <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                      <span>Ready</span>
                    </div>
                  </Card>
                ))}
                
                {/* Empty slots for visual effect */}
                {players.length < 8 && [...Array(Math.min(3, 8 - players.length))].map((_, i) => (
                  <Card
                    key={`empty-${i}`}
                    className="p-4 sm:p-6 text-center opacity-20 border-2 border-dashed border-primary-500/30"
                  >
                    <div className="text-4xl sm:text-5xl mb-3">👤</div>
                    <div className="font-mono text-xxs sm:text-xs text-light-600 uppercase">Waiting...</div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl sm:text-8xl mb-4 opacity-30 animate-pulse-slow">👥</div>
                <p className="font-display text-lg sm:text-xl text-primary-400 uppercase mb-2">
                  No Players Yet
                </p>
                <p className="font-mono text-xs sm:text-sm text-light-500">
                  &gt; Share the PIN above to invite players!
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
