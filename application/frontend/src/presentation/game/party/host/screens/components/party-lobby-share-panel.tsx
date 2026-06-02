import { QrShareCard } from '../../../../../shared/ui/data/qr-share-card';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { HeroPanel } from '../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../shared/ui/layout/typography';
import { PartyPinPreview } from '../../../shared/screens/components/party-pin-preview';

interface PartyLobbySharePanelProps {
  readonly ariaLabel: string;
  readonly copiedLabel: string;
  readonly copyFailedLabel: string;
  readonly copyLabel: string;
  readonly enterCodeLabel: string;
  readonly heading: string;
  readonly joinUrl: string;
  readonly orVisitLabel: string;
  readonly pin: string;
  readonly pinAriaLabel: string;
  readonly scanLabel: string;
}

export function PartyLobbySharePanel({
  ariaLabel,
  copiedLabel,
  copyFailedLabel,
  copyLabel,
  enterCodeLabel,
  heading,
  joinUrl,
  orVisitLabel,
  pin,
  pinAriaLabel,
  scanLabel,
}: PartyLobbySharePanelProps) {
  return (
    <section aria-label={ariaLabel}>
      <HeroPanel padding="xl">
        <ContentStack align="center" gap="xl">
          <Heading hero>{heading}</Heading>

          <QrShareCard
            copiedLabel={copiedLabel}
            copyFailedLabel={copyFailedLabel}
            copyLabel={copyLabel}
            href={joinUrl}
            scanLabel={scanLabel}
            visitLabel={orVisitLabel}
          />

          <PartyPinPreview ariaLabel={pinAriaLabel} label={enterCodeLabel} pin={pin} />
        </ContentStack>
      </HeroPanel>
    </section>
  );
}
