export function HostBadge() {
  return (
    <div className="mb-4 flex justify-center">
      <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
        <span className="text-3xl animate-bounce-slow">👑</span>
        <span className="font-display text-accent-400 uppercase text-lg tracking-wider">
          HOST VIEW - SCREEN SHARE MODE
        </span>
      </div>
    </div>
  );
}
