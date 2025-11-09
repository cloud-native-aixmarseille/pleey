import { ReactNode } from "react";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { Card } from "../../../../shared/components";
import { PinCharacter } from "./types";
import { createStyles } from "../../../../shared/ui/styles";
import { composeClasses } from "../../../../shared/ui/utils/composeClasses";

const styles = createStyles("JoinOptionsSection", {
  slot1: "mb-6 sm:mb-8",
  slot2:
    "p-6 sm:p-10 md:p-12 animate-scale-in retro-shadow border-4 border-accent-500/50",
  slot3: "space-y-8",
  slot4: "text-center space-y-4",
  slot5:
    "font-display text-[#0b0d21] text-2xl sm:text-3xl uppercase tracking-[0.12em] drop-shadow-[0_0_18px_rgba(11,13,33,0.25)]",
  slot6:
    "font-mono text-[#1f233e] text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto",
  slot7: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
  slot8:
    "rounded-2xl bg-white/95 text-[#0b0d21] border border-white/40 p-6 sm:p-8 shadow-[0_20px_40px_rgba(11,13,33,0.25)] space-y-6",
  slot9: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
  slot10:
    "font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.12em] text-[#6b48ff]",
  slot11: "font-display text-xl sm:text-2xl text-[#0b0d21] tracking-[0.06em]",
  slot12: "font-mono text-base sm:text-lg text-[#1f233e] leading-relaxed",
  slot13: "flex justify-center",
  slot14:
    "bg-white p-4 sm:p-6 rounded-xl border-4 border-accent-500/50 shadow-[0_20px_45px_rgba(59,255,235,0.25)]",
  slot15: "font-mono text-sm sm:text-base text-[#4a4f73] text-center",
  slot16: "space-y-6",
  slot17:
    "rounded-2xl bg-white/95 text-[#0b0d21] border border-white/40 p-6 sm:p-8 shadow-[0_20px_40px_rgba(11,13,33,0.25)] space-y-5",
  slot18:
    "font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.12em] text-[#ff33c6]",
  slot19: "font-mono text-xl sm:text-2xl text-[#1f233e] leading-relaxed",
  slot20: "text-[#6b48ff] font-semibold",
  slot21: "text-[#0abdc6] hover:text-[#06a4ad] underline decoration-dotted",
  slot22: "relative text-center space-y-5 sm:space-y-6 px-2 sm:px-4 md:px-6",
  slot23:
    "font-display text-xs sm:text-sm text-[#6b48ff] tracking-[0.45em] uppercase block",
  slot24: "flex justify-center gap-2 sm:gap-3 md:gap-4",
  slot25: "sr-only",
  slot26:
    "font-mono text-base sm:text-lg text-white bg-[#0b0d21] hover:bg-[#181c3b] transition-colors inline-flex items-center gap-3 px-6 py-3 rounded-lg",
  slot27: "text-success-400",
  slot28:
    "rounded-2xl bg-white/90 text-[#0b0d21] border border-white/30 px-6 py-5 text-center shadow-[0_12px_28px_rgba(11,13,33,0.2)]",
  slot29: "font-mono text-base sm:text-lg font-semibold tracking-[0.08em]",
  slot30: "space-y-4 mt-6",
  pinSlotPlaceholder:
    "inline-flex min-w-[3rem] sm:min-w-[3.5rem] md:min-w-[4rem] items-center justify-center rounded-2xl border-4 bg-[#0b0d21]/95 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 font-display text-3xl sm:text-4xl md:text-5xl shadow-[0_0_38px_rgba(0,255,204,0.4)] border-dashed border-accent-500/35 text-accent-500/35",
  pinSlotActive:
    "inline-flex min-w-[3rem] sm:min-w-[3.5rem] md:min-w-[4rem] items-center justify-center rounded-2xl border-4 bg-[#0b0d21]/95 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 font-display text-3xl sm:text-4xl md:text-5xl shadow-[0_0_38px_rgba(0,255,204,0.4)] border-accent-500/60 text-accent-400",
});

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
    <section aria-labelledby={instructionsTitleId} {...styles.slot1}>
      <Card {...styles.slot2}>
        <div {...styles.slot3}>
          <header {...styles.slot4}>
            <h2 id={instructionsTitleId} {...styles.slot5}>
              {t("game.joinOptions")}
            </h2>
            <p {...styles.slot6}>{t("game.joinOptionsLead")}</p>
          </header>

          <div {...styles.slot7}>
            <div {...styles.slot8}>
              <div {...styles.slot9}>
                <span {...styles.slot10}>
                  {t("game.joinStepLabel", { step: "1" })}
                </span>
                <span {...styles.slot11}>{t("game.joinStepScanTitle")}</span>
              </div>
              <p {...styles.slot12}>{t("game.joinStepScanDescription")}</p>
              <div {...styles.slot13}>
                <div {...styles.slot14}>
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
              <p {...styles.slot15}>{t("game.qrCodeAlt", { pin: gamePin })}</p>
            </div>

            <div {...styles.slot16}>
              <div {...styles.slot17}>
                <div {...styles.slot9}>
                  <span {...styles.slot18}>
                    {t("game.joinStepLabel", { step: "2" })}
                  </span>
                  <span {...styles.slot11}>
                    {t("game.joinStepManualTitle")}
                  </span>
                </div>
                {joinLink && (
                  <p {...styles.slot19}>
                    <span {...styles.slot20}>
                      {t("game.joinManualLinkPrefix")}:
                    </span>
                    <br />
                    <a
                      href={joinLink}
                      target="_blank"
                      rel="noreferrer"
                      {...styles.slot21}
                    >
                      {joinUrlForDisplay}
                    </a>
                  </p>
                )}
                <p {...styles.slot19}>{manualJoinInstructions}</p>
                <div {...styles.slot22}>
                  <span {...styles.slot23}>{t("game.enterThisPin")}</span>
                  <div {...styles.slot24} aria-label={pinAriaLabel}>
                    {pinCharacters.map(({ value, isPlaceholder }, index) => {
                      const slotStyle = isPlaceholder
                        ? styles.pinSlotPlaceholder
                        : styles.pinSlotActive;
                      const className = composeClasses(
                        slotStyle.className,
                        copiedPin && !isPlaceholder
                          ? "animate-pulse"
                          : undefined
                      );

                      return (
                        <span
                          key={`pin-slot-${index}`}
                          className={className}
                          data-style-id={slotStyle["data-style-id"]}
                          aria-hidden="true"
                        >
                          {value}
                        </span>
                      );
                    })}
                  </div>
                  <span {...styles.slot25} aria-live="polite">
                    {pinAriaLabel}
                  </span>
                  <button
                    type="button"
                    onClick={copyPinToClipboard}
                    {...styles.slot26}
                    aria-describedby={
                      copyStatusMessage ? copyFeedbackId : undefined
                    }
                    aria-label={t("game.copyPinAriaLabel")}
                  >
                    {copiedPin ? (
                      <>
                        <span {...styles.slot27} aria-hidden="true">
                          ✓
                        </span>
                        <span {...styles.slot27}>{t("game.copied")}</span>
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

              <div {...styles.slot28}>
                <span {...styles.slot29}>
                  {t("game.joinStepLabel", { step: "3" })} —{" "}
                  {t("game.joinStepWaitDescription")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {footer && <div {...styles.slot30}>{footer}</div>}
    </section>
  );
}
