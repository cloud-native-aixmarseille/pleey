interface JoinGameSystemStatusProps {
  statusMessage?: string;
}

const DEFAULT_STATUS_MESSAGE = "> WAITING FOR INPUT...";

export function JoinGameSystemStatus({
  statusMessage = DEFAULT_STATUS_MESSAGE,
}: JoinGameSystemStatusProps) {
  return (
    <section className="mb-8 pb-4 border-b-2 border-primary-500/30">
      <p className="font-mono text-accent-400 text-xs sm:text-sm">
        <span className="text-success-500 animate-pulse">●</span> SYSTEM READY
      </p>
      <p className="font-mono text-primary-300 text-xs mt-1">{statusMessage}</p>
    </section>
  );
}
