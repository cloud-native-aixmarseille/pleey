import { ReactNode } from "react";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { Card } from "../../../../shared/components";
import { PinCharacter } from "./types";

interface JoinOptionsSectionProps {
  readonly instructionsTitleId: string;
  readonly gamePin: string;
  readonly joinLink: string | null;
  readonly joinUrlForDisplay: string;
  readonly manualJoinInstructions: string;
  readonly pinCharacters: readonly PinCharacter[];
  readonly pinAriaLabel: string;
  readonly copyFeedbackId: string;
  readonly copyStatusMessage: string;
  readonly copiedPin: boolean;
  readonly copyPinToClipboard: () => Promise<void> | void;
  readonly footer?: ReactNode;
}

export default function JoinOptionsSection({
  instructionsTitleId,
  gamePin,
  joinLink,
  joinUrlForDisplay,
  manualJoinInstructions,
  pinCharacters,
  pinAriaLabel,
  copyFeedbackId,
  copyStatusMessage,
  copiedPin,
  copyPinToClipboard,
  footer,
}: JoinOptionsSectionProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby={instructionsTitleId} className="mb-6 sm:mb-8">
      <Card className="p-6 sm:p-10 md:p-12 animate-scale-in retro-shadow border-4 border-accent-500/50">
        <div className="space-y-8">
          <header className="text-center space-y-4">
            <h2
              id={instructionsTitleId}
              className="font-display text-[#0b0d21] text-2xl sm:text-3xl uppercase tracking-[0.12em] drop-shadow-[0_0_18px_rgba(11,13,33,0.25)]"
            >
              {t("game.joinOptions")}
            </h2>
            <p className="font-mono text-[#1f233e] text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
              {t("game.joinOptionsLead")}
            </p>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl bg-white/95 text-[#0b0d21] border border-white/40 p-6 sm:p-8 shadow-[0_20px_40px_rgba(11,13,33,0.25)] space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.12em] text-[#6b48ff]">
                  {t("game.joinStepLabel", { step: "1" })}
                </span>
                <span className="font-display text-xl sm:text-2xl text-[#0b0d21] tracking-[0.06em]">
                  {t("game.joinStepScanTitle")}
                </span>
              </div>
              <p className="font-mono text-base sm:text-lg text-[#1f233e] leading-relaxed">
                {t("game.joinStepScanDescription")}
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-4 sm:p-6 rounded-xl border-4 border-accent-500/50 shadow-[0_20px_45px_rgba(59,255,235,0.25)]">
                  <QRCode
                    value={joinLink || gamePin}
                    size={220}
                    level="H"
                    fgColor="#0a0a1f"
                    bgColor="#ffffff"
                    aria-label={t("game.qrCodeAlt", { pin: gamePin })}
                    role="img"
                  />
                </div>
              </div>
              <p className="font-mono text-sm sm:text-base text-[#4a4f73] text-center">
                {t("game.qrCodeAlt", { pin: gamePin })}
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-white/95 text-[#0b0d21] border border-white/40 p-6 sm:p-8 shadow-[0_20px_40px_rgba(11,13,33,0.25)] space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.12em] text-[#ff33c6]">
                    {t("game.joinStepLabel", { step: "2" })}
                  </span>
                  <span className="font-display text-xl sm:text-2xl text-[#0b0d21] tracking-[0.06em]">
                    {t("game.joinStepManualTitle")}
                  </span>
                </div>
                {joinLink && (
                  <p className="font-mono text-xl sm:text-2xl text-[#1f233e] leading-relaxed">
                    <span className="text-[#6b48ff] font-semibold">
                      {t("game.joinManualLinkPrefix")}:
                    </span>
                    <br />
                    <a
                      href={joinLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0abdc6] hover:text-[#06a4ad] underline decoration-dotted"
                    >
                      {joinUrlForDisplay}
                    </a>
                  </p>
                )}
                <p className="font-mono text-xl sm:text-2xl text-[#1f233e] leading-relaxed">
                  {manualJoinInstructions}
                </p>
                <div className="relative text-center space-y-5 sm:space-y-6 px-2 sm:px-4 md:px-6">
                  <span className="font-display text-xs sm:text-sm text-[#6b48ff] tracking-[0.45em] uppercase block">
                    {t("game.enterThisPin")}
                  </span>
                  <div
                    className="flex justify-center gap-2 sm:gap-3 md:gap-4"
                    role="text"
                    aria-label={pinAriaLabel}
                  >
                    {pinCharacters.map(({ value, isPlaceholder }, index) => (
                      <span
                        key={`pin-slot-${index}`}
                        className={`inline-flex min-w-[3rem] sm:min-w-[3.5rem] md:min-w-[4rem] items-center justify-center rounded-2xl border-4 ${
                          isPlaceholder
                            ? "border-dashed border-accent-500/35 text-accent-500/35"
                            : "border-accent-500/60 text-accent-400"
                        } bg-[#0b0d21]/95 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 font-display text-3xl sm:text-4xl md:text-5xl shadow-[0_0_38px_rgba(0,255,204,0.4)] ${
                          copiedPin && !isPlaceholder ? "animate-pulse" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                  <span className="sr-only" aria-live="polite">
                    {pinAriaLabel}
                  </span>
                  <button
                    type="button"
                    onClick={copyPinToClipboard}
                    className="font-mono text-base sm:text-lg text-white bg-[#0b0d21] hover:bg-[#181c3b] transition-colors inline-flex items-center gap-3 px-6 py-3 rounded-lg"
                    aria-describedby={
                      copyStatusMessage ? copyFeedbackId : undefined
                    }
                    aria-label={t("game.copyPinAriaLabel")}
                  >
                    {copiedPin ? (
                      <>
                        <span className="text-success-400" aria-hidden="true">
                          ✓
                        </span>
                        <span className="text-success-400">
                          {t("game.copied")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">📋</span>
                        <span>{t("game.copyPin")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white/90 text-[#0b0d21] border border-white/30 px-6 py-5 text-center shadow-[0_12px_28px_rgba(11,13,33,0.2)]">
                <span className="font-mono text-base sm:text-lg font-semibold tracking-[0.08em]">
                  {t("game.joinStepLabel", { step: "3" })} —{" "}
                  {t("game.joinStepWaitDescription")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {footer && <div className="space-y-4 mt-6">{footer}</div>}
    </section>
  );
}
