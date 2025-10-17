import { LeaderboardEntry } from '../../../shared/types';

interface LeaderboardPageProps {
  leaderboard: LeaderboardEntry[];
  onNavigate: (view: string) => void;
}

export default function LeaderboardPage({
  leaderboard,
  onNavigate
}: LeaderboardPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
            🏆 CLASSEMENT FINAL 🏆
          </h2>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end">
          {/* 2ème place */}
          {leaderboard[1] && (
            <div className="text-center">
              <div className="bg-gray-300 rounded-t-3xl p-6 shadow-2xl">
                <div className="text-6xl mb-2">🥈</div>
                <div className="text-2xl font-black text-gray-800">{leaderboard[1].username}</div>
                <div className="text-xl font-bold text-gray-600">{leaderboard[1].totalPoints} pts</div>
              </div>
              <div className="bg-gray-400 h-32 rounded-b-2xl flex items-center justify-center">
                <span className="text-6xl font-black text-white">2</span>
              </div>
            </div>
          )}

          {/* 1ère place */}
          {leaderboard[0] && (
            <div className="text-center">
              <div className="bg-yellow-300 rounded-t-3xl p-8 shadow-2xl transform scale-110">
                <div className="text-8xl mb-2">👑</div>
                <div className="text-3xl font-black text-gray-800">{leaderboard[0].username}</div>
                <div className="text-2xl font-bold text-gray-600">{leaderboard[0].totalPoints} pts</div>
              </div>
              <div className="bg-yellow-400 h-48 rounded-b-2xl flex items-center justify-center">
                <span className="text-8xl font-black text-white">1</span>
              </div>
            </div>
          )}

          {/* 3ème place */}
          {leaderboard[2] && (
            <div className="text-center">
              <div className="bg-orange-300 rounded-t-3xl p-6 shadow-2xl">
                <div className="text-6xl mb-2">🥉</div>
                <div className="text-2xl font-black text-gray-800">{leaderboard[2].username}</div>
                <div className="text-xl font-bold text-gray-600">{leaderboard[2].totalPoints} pts</div>
              </div>
              <div className="bg-orange-400 h-24 rounded-b-2xl flex items-center justify-center">
                <span className="text-6xl font-black text-white">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Reste du classement */}
        {leaderboard.slice(3).map((player, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-gray-400">#{index + 4}</span>
              <span className="text-2xl font-bold text-gray-800">{player.username}</span>
            </div>
            <span className="text-2xl font-black text-purple-600">{player.totalPoints} pts</span>
          </div>
        ))}

        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition mt-8"
        >
          Nouvelle partie
        </button>
      </div>
    </div>
  );
}
