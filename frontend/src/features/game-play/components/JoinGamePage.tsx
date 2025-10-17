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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-4xl font-black text-gray-800 mb-8">Rejoindre une partie</h2>
        <input
          type="text"
          value={gamePin}
          onChange={(e) => onGamePinChange(e.target.value)}
          placeholder="Entrer le code PIN"
          className="w-full p-6 border-4 border-gray-300 rounded-xl mb-6 text-center text-3xl font-bold focus:border-orange-500 focus:outline-none"
          maxLength={6}
        />
        <button
          onClick={onJoinGame}
          disabled={gamePin.length !== 6}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Rejoindre
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="w-full mt-4 text-gray-600 hover:text-orange-600"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
