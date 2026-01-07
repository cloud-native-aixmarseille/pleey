import { ReactNode } from "react";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  ArcadeCardGrid,
  ArcadeGlassStack,
  Card,
  PrimaryButton,
} from "../../../../../presentation/shared/ui/components";
import { PinCharacter } from "./types";
import { composeClasses } from "../../../../shared/utils/composeClasses";

const PIN_SLOT_BASE =
  "inline-flex min-w-[clamp(2rem,10vw,2.75rem)] items-center justify-center rounded-2xl border-2 px-2.5 py-3 font-display text-center text-[clamp(1.6rem,5.5vw,2rem)] leading-none transition-transform sm:px-3 sm:py-3";
const PIN_SLOT_ACTIVE =
  "border-accent-400 text-accent-900 bg-light-50/80 dark:text-accent-200 dark:bg-dark-900/70 dark:shadow-[0_0_32px_rgba(59,255,235,0.45)]";
const PIN_SLOT_PLACEHOLDER =
  "border-dashed border-accent-500/35 text-accent-900/35 bg-light-50/60 dark:text-accent-500/30 dark:bg-dark-900/40";

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
    <ArcadeGlassStack
      title={t("game.joinOptions")}
      subtitle={t("game.joinOptionsLead")}
      tone="accent"
      align="center"
      width="lg"
      spacing="md"
      titleId={instructionsTitleId}
    >
      <ArcadeCardGrid layout="double" bottomSpacing="md">
        <div className="flex h-full flex-col">
          <Card
            surface="glass"
            variant="accent"
            padding="md"
            elevation="glow"
            border="regular"
            fullWidth
          >
            <div className="flex h-full flex-col gap-5 text-center sm:text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ArcadeBadge variant="accent" size="sm">
                  {t("game.joinStepLabel", { step: "1" })}
                </ArcadeBadge>
                <span className="font-display text-xl uppercase tracking-[0.24em] text-dark-900 dark:text-light-100 sm:text-2xl">
                  {t("game.joinStepScanTitle")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-dark-500 dark:text-light-200 sm:text-base">
                {t("game.joinStepScanDescription")}
              </p>
              <div className="flex flex-1 flex-col items-center gap-4">
                <div className="rounded-2xl border-2 border-accent-400/40 bg-white/95 p-3 shadow-[0_16px_36px_rgba(59,255,235,0.25)] sm:p-4">
                  <QRCode
                    value={joinLink || gamePin}
                    size={180}
                    level="H"
                    fgColor="#0a0a1f"
                    bgColor="#ffffff"
                    aria-label={t("game.qrCodeAlt", { pin: gamePin })}
                    role="img"
                  />
                </div>
                <p className="text-center text-sm font-mono uppercase tracking-[0.18em] text-light-500 sm:text-base">
                  {t("game.qrCodeAlt", { pin: gamePin })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex h-full flex-col">
          <Card
            surface="glass"
            variant="primary"
            padding="none"
            elevation="glow"
            border="regular"
            overflow="hidden"
            fullWidth
          >
            <div className="flex h-full flex-col gap-5 bg-light-50/70 px-5 py-5 text-dark-500 dark:bg-gradient-to-br dark:from-primary-900/60 dark:via-dark-700/75 dark:to-dark-800/80 dark:text-light-100 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ArcadeBadge variant="primary" size="sm">
                  {t("game.joinStepLabel", { step: "2" })}
                </ArcadeBadge>
                <span className="font-display text-xl uppercase tracking-[0.24em] text-dark-900 dark:text-light-100 sm:text-2xl">
                  {t("game.joinStepManualTitle")}
                </span>
              </div>

              {joinLink ? (
                <p className="text-sm leading-relaxed text-dark-500 dark:text-light-200 sm:text-base">
                  <span className="font-semibold text-primary-900 dark:text-primary-200">
                    {t("game.joinManualLinkPrefix")}:
                  </span>
                  <br />
                  <a
                    href={joinLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-900 underline decoration-dotted transition-colors hover:text-accent-800 dark:text-accent-200 dark:hover:text-accent-100"
                  >
                    {joinUrlForDisplay}
                  </a>
                </p>
              ) : null}

              <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary-500/25 bg-light-50/70 px-4 py-5 text-center dark:border-primary-500/30 dark:bg-primary-900/35 sm:px-6">
                <span className="font-display text-xs uppercase tracking-[0.45em] text-primary-900 dark:text-primary-200 sm:text-sm">
                  {t("game.enterThisPin")}
                </span>
                <div
                  className="flex max-w-full justify-center gap-2 sm:gap-3 md:gap-3.5"
                  aria-label={pinAriaLabel}
                >
                  {pinCharacters.map(({ value, isPlaceholder }, index) => (
                    <span
                      key={`pin-slot-${index}`}
                      className={composeClasses(
                        PIN_SLOT_BASE,
                        isPlaceholder ? PIN_SLOT_PLACEHOLDER : PIN_SLOT_ACTIVE,
                        copiedPin && !isPlaceholder
                          ? "animate-pulse"
                          : undefined
                      )}
                      aria-hidden="true"
                    >
                      {value}
                    </span>
                  ))}
                </div>
                <span
                  className="sr-only"
                  role="status"
                  aria-live="polite"
                  aria-label={pinAriaLabel}
                >
                  {pinAriaLabel}
                </span>
                <PrimaryButton
                  size="md"
                  effect="retro"
                  onClick={copyPinToClipboard}
                  aria-describedby={
                    copyStatusMessage ? copyFeedbackId : undefined
                  }
                  aria-label={t("game.copyPinAriaLabel")}
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true">{copiedPin ? "✓" : "📋"}</span>
                    <span>{t(copiedPin ? "game.copied" : "game.copyPin")}</span>
                  </span>
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card
            surface="glass"
            variant="neutral"
            padding="md"
            elevation="glow"
            border="regular"
            alignment="center"
          >
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-dark-500 dark:text-light-200 sm:text-base">
              {t("game.joinStepLabel", { step: "3" })} —{" "}
              {t("game.joinStepWaitDescription")}
            </span>
          </Card>
        </div>
      </ArcadeCardGrid>

      {footer ? <div className="space-y-4">{footer}</div> : null}
    </ArcadeGlassStack>
  );
}
