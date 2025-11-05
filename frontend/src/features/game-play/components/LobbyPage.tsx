import { Player } from "../../../shared/types";
import { Button, Card, Container } from "../../../shared/components";
import { useState, useEffect, useRef, useId } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";

interface LobbyPageProps {
  gamePin: string;
  players: Player[];
  isAdmin: boolean;
  onStartGame: () => void;
  questionCount?: number;
}

export default function LobbyPage({
  gamePin,
  players,
  isAdmin,
  onStartGame,
  questionCount = 0,
}: LobbyPageProps) {
  const { t } = useTranslation();
  const [copiedPin, setCopiedPin] = useState(false);
  const [copyStatusMessage, setCopyStatusMessage] = useState("");
  const [playerCountMessage, setPlayerCountMessage] = useState(() =>
    players.length === 0
      ? t("game.noPlayersYet")
      : `${players.length} ${players.length !== 1 ? t("game.playersReady") : t("game.playerReady")}`
  );

  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const previousPlayerCount = useRef(players.length);

  const lobbyTitleId = useId();
  const instructionsTitleId = useId();
  const playersSectionTitleId = useId();
  const startHintId = useId();
  const questionHintId = useId();
  const copyFeedbackId = useId();
  const playerStatusAnnounceId = useId();

  const mustWaitForPlayers = players.length < 1;
  const hasQuestions = questionCount > 0;
  const cannotStartGame = mustWaitForPlayers || !hasQuestions;
  const startButtonDescription =
    [
      mustWaitForPlayers ? startHintId : null,
      !hasQuestions ? questionHintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const copyPinToClipboard = async () => {
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = null;
    }

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API not available");
      }

      await navigator.clipboard.writeText(gamePin);
      setCopiedPin(true);
      setCopyStatusMessage(t("game.clipboardCopied"));
    } catch (error) {
      setCopiedPin(false);
      setCopyStatusMessage(
        t("game.clipboardError", { pin: gamePin })
      );
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setCopiedPin(false);
      setCopyStatusMessage("");
    }, 2000);
  };

  // Heartbeat effect for player count
  const [heartbeat, setHeartbeat] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat((prev: boolean) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalPlayers = players.length;
    const previousCount = previousPlayerCount.current;

    let message =
      totalPlayers === 0
        ? t("game.noPlayersYet")
        : `${totalPlayers} ${totalPlayers !== 1 ? t("game.playersReady") : t("game.playerReady")}`;

    if (totalPlayers !== previousCount) {
      const delta = totalPlayers - previousCount;
      if (delta > 0) {
        message = `${delta} ${
          delta > 1 ? t("game.newPlayersJoined") : t("game.newPlayerJoined")
        } ${totalPlayers} ${t("game.totalPlayers")}`;
      } else {
        const absDelta = Math.abs(delta);
        message = `${absDelta} ${
          absDelta > 1 ? t("game.playersLeft") : t("game.playerLeft")
        } ${totalPlayers} ${t("game.remainingPlayers")}`;
      }
    }

    previousPlayerCount.current = totalPlayers;
    setPlayerCountMessage(message);
  }, [players.length]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-game-gradient crt-screen p-4 sm:p-6 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Container size="lg">
        <main
          role="main"
          aria-labelledby={lobbyTitleId}
          className="relative z-10"
        >
          <div
            className="sr-only"
            role="status"
            aria-live="assertive"
            id={copyFeedbackId}
          >
            {copyStatusMessage}
          </div>
          <div className="sr-only" role="status" aria-live="polite">
            {playerCountMessage}
          </div>

          {/* Admin Host Badge - Visible only to admin */}
          {isAdmin && (
            <div className="mb-6 flex justify-center">
              <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
                <span className="text-3xl animate-bounce-slow">👑</span>
                <div className="text-center">
                  <span className="font-display text-accent-400 uppercase text-base sm:text-lg tracking-wider block">
                    {t("game.hostMode")}
                  </span>
                  <span className="font-mono text-accent-500 text-xs uppercase tracking-wider">
                    {t("game.screenShareHint")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Arcade-style header */}
          <div className="text-center mb-8">
            <h1
              id={lobbyTitleId}
              className="font-display text-3xl sm:text-4xl md:text-5xl uppercase text-neon text-accent-500 mb-2 tracking-wider animate-glow"
            >
              {t("game.gameLobby")}
            </h1>
            <p className="font-mono text-primary-300 text-xs sm:text-sm animate-pulse-slow">
              {t("game.waitingForPlayersToJoin")}
            </p>
          </div>

          {/* Main PIN Display Card - Optimized for screen sharing */}
          <section
            aria-labelledby={instructionsTitleId}
            className="mb-6 sm:mb-8"
          >
            <Card className="p-6 sm:p-10 md:p-12 animate-scale-in retro-shadow border-4 border-accent-500/50">
              {/* Instructions banner */}
              <div className="mb-6 sm:mb-8 glass-effect rounded-xl p-4 sm:p-6 border-2 border-primary-500/30">
                <div className="text-center">
                  <h2
                    id={instructionsTitleId}
                    className="font-display text-accent-400 text-xs sm:text-sm uppercase tracking-wider mb-3"
                  >
                    {t("game.howToJoinTitle")}
                  </h2>
                  <ol className="space-y-2 font-mono text-light-200 text-xs sm:text-sm text-left sm:text-center list-decimal list-inside">
                    <li>{t("game.howToJoinStep1")}</li>
                    <li>{t("game.howToJoinStep2")}</li>
                    <li>{t("game.howToJoinStep3")}</li>
                  </ol>
                </div>
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
                  type="button"
                  onClick={copyPinToClipboard}
                  className="mt-4 font-mono text-xs sm:text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2 mx-auto border-2 border-primary-500/30 px-4 py-2 rounded-lg hover:border-primary-500 hover:bg-primary-500/10"
                  aria-describedby={
                    copyStatusMessage ? copyFeedbackId : undefined
                  }
                  aria-label="Copy game PIN to clipboard"
                >
                  {copiedPin ? (
                    <>
                      <span className="text-success-500">✓</span>
                      <span className="text-success-500">{t("game.copied")}</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">📋</span>
                      <span>{t("game.copyPin")}</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code Section - Alternative join method */}
              <div className="mb-6 sm:mb-8">
                <div className="glass-effect rounded-2xl p-6 border-2 border-secondary-500/30">
                  <h3 className="font-display text-sm sm:text-base text-secondary-300 uppercase text-center tracking-wider mb-4">
                    {t("game.scanQrCode")}
                  </h3>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl border-4 border-accent-500/50 shadow-neon-accent">
                      <QRCodeSVG
                        value={`${window.location.origin}/join?pin=${gamePin}`}
                        size={180}
                        level="H"
                        includeMargin={true}
                        fgColor="#0a0a1f"
                        bgColor="#ffffff"
                        aria-label={t("game.qrCodeAlt", { pin: gamePin })}
                        role="img"
                      />
                    </div>
                  </div>
                  <p className="font-mono text-xs text-light-400 text-center mt-4">
                    {t("game.qrCodeAlt", { pin: gamePin })}
                  </p>
                </div>
              </div>

              {/* Player Count with Heartbeat */}
              <div
                className="glass-effect rounded-xl px-6 sm:px-8 py-4 sm:py-5 inline-flex items-center gap-4 mb-6 sm:mb-8 border-2 border-secondary-500/30"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-describedby={playerStatusAnnounceId}
              >
                <span
                  className={`text-4xl sm:text-5xl transition-transform duration-100 ${
                    heartbeat ? "scale-110" : "scale-100"
                  }`}
                  aria-hidden="true"
                >
                  {players.length > 0 ? "💚" : "🤍"}
                </span>
                <div className="text-left">
                  <div className="font-display text-3xl sm:text-4xl text-accent-400 uppercase">
                    {players.length}
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-light-400 uppercase">
                    {t("game.playersReadyLabel")}
                  </div>
                </div>
                <div
                  className={`ml-4 ${players.length > 0 ? "flex" : "hidden"}`}
                  aria-hidden="true"
                >
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-success-500"></span>
                  </span>
                </div>
                <span id={playerStatusAnnounceId} className="sr-only">
                  {playerCountMessage}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {isAdmin && (
                  <Button
                    variant="success"
                    size="xl"
                    fullWidth
                    onClick={onStartGame}
                    disabled={cannotStartGame}
                    aria-describedby={startButtonDescription}
                    className="retro-shadow font-display text-base sm:text-lg hover:scale-105 transform transition-all"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-xl sm:text-2xl" aria-hidden="true">
                        ▶
                      </span>
                      <span>{t("game.startGame").toUpperCase()}</span>
                      <span className="text-xl sm:text-2xl" aria-hidden="true">
                        ◀
                      </span>
                    </span>
                  </Button>
                )}

                {!isAdmin && (
                  <div
                    className="glass-effect rounded-xl px-6 py-4 border-2 border-primary-500/30 animate-pulse-slow"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="font-mono text-primary-400 text-sm sm:text-base flex items-center justify-center gap-3">
                      <span
                        className="relative flex h-3 w-3"
                        aria-hidden="true"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </span>
                      <span className="uppercase tracking-wider">
                        {t("game.waitingForHost")}
                      </span>
                    </p>
                  </div>
                )}

                {isAdmin && mustWaitForPlayers && (
                  <div className="text-center mt-4">
                    <p
                      id={startHintId}
                      className="font-mono text-xs text-light-500 animate-pulse"
                      role="status"
                      aria-live="polite"
                    >
                      {t("game.needOnePlayer")}
                    </p>
                  </div>
                )}

                {isAdmin && !hasQuestions && (
                  <div className="text-center mt-2">
                    <p
                      id={questionHintId}
                      className="font-mono text-xs text-danger-500 animate-pulse"
                      role="status"
                      aria-live="polite"
                    >
                      {t("game.addOneQuestion")}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* Players Grid */}
          <section aria-labelledby={playersSectionTitleId}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
              <h2
                id={playersSectionTitleId}
                className="font-display text-base sm:text-xl text-primary-300 uppercase tracking-wider flex items-center gap-2"
              >
                <span>{t("game.connectedPlayers")}</span>
                <span className="glass-effect rounded-full px-3 py-1 text-sm sm:text-lg border-2 border-accent-500/30 text-accent-400">
                  {players.length}
                </span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
            </div>

            {players.length > 0 ? (
              <ul
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 list-none"
                aria-label="Players connected to the lobby"
              >
                {players.map((player, index) => (
                  <li key={player.id} className="list-none">
                    <Card
                      hover
                      className="p-4 sm:p-6 text-center animate-scale-in border-2 border-accent-500/20 hover:border-accent-500"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className="text-4xl sm:text-5xl mb-3 animate-bounce-slow"
                        aria-hidden="true"
                      >
                        {
                          [
                            "🦊",
                            "🐻",
                            "🐼",
                            "🐨",
                            "🦁",
                            "🐯",
                            "🐸",
                            "🐷",
                            "🐵",
                            "🐶",
                          ][index % 10]
                        }
                      </div>
                      <div
                        className="font-mono text-xs sm:text-sm text-accent-400 truncate font-bold uppercase"
                        title={player.username}
                      >
                        {player.username}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 border border-success-500 text-success-400 rounded-lg text-xxs sm:text-xs font-mono uppercase">
                        <span
                          className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"
                          aria-hidden="true"
                        ></span>
                        <span>{t("game.ready")}</span>
                      </div>
                    </Card>
                  </li>
                ))}

                {/* Empty slots for visual effect */}
                {players.length < 8 &&
                  [...Array(Math.min(3, 8 - players.length))].map((_, i) => (
                    <li key={`empty-${i}`} className="list-none">
                      <Card
                        className="p-4 sm:p-6 text-center opacity-20 border-2 border-dashed border-primary-500/30"
                        aria-hidden="true"
                      >
                        <div className="text-4xl sm:text-5xl mb-3">👤</div>
                        <div className="font-mono text-xxs sm:text-xs text-light-600 uppercase">
                          {t("game.waiting")}
                        </div>
                      </Card>
                    </li>
                  ))}
              </ul>
            ) : (
              <div
                className="text-center py-12"
                role="status"
                aria-live="polite"
              >
                <div
                  className="text-6xl sm:text-8xl mb-4 opacity-30 animate-pulse-slow"
                  aria-hidden="true"
                >
                  👥
                </div>
                <p className="font-display text-lg sm:text-xl text-primary-400 uppercase mb-2">
                  {t("game.noPlayersYetTitle")}
                </p>
                <p className="font-mono text-xs sm:text-sm text-light-500">
                  {t("game.sharePin")}
                </p>
              </div>
            )}
          </section>
        </main>
      </Container>
    </div>
  );
}
