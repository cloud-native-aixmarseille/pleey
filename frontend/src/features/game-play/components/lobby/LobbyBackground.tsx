export default function LobbyBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-lobby-background="true"
      aria-hidden="true"
    >
      <div className="absolute left-10 top-10 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl animate-float" />
      <div className="animation-delay-300 absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl animate-float" />
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-500/5 blur-3xl animate-pulse-slow" />
    </div>
  );
}
