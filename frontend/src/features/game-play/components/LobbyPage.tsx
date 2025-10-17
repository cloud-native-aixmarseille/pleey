import { Player } from '../../../shared/types';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Code PIN
          </h2>
          <div className="text-7xl font-black text-gray-800 mb-8 tracking-wider">
            {gamePin}
          </div>
          <div className="text-2xl font-bold text-gray-600 mb-8">
            {players.length} joueur{players.length > 1 ? 's' : ''} connecté{players.length > 1 ? 's' : ''}
          </div>
          {isAdmin && (
            <button
              onClick={onStartGame}
              disabled={players.length < 1}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50"
            >
              🚀 Démarrer la partie
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((player, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition"
            >
              <div className="text-4xl mb-2">
                {['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐷'][index % 8]}
              </div>
              <div className="font-bold text-gray-800 truncate">
                {player.username}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
