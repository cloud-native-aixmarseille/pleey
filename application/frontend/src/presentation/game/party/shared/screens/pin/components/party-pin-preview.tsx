import { PinCodePreview } from '../../../../../../shared/ui/data/pin-code-preview';

interface PartyPinPreviewProps {
  readonly ariaLabel: string;
  readonly label: string;
  readonly pin: string;
}

export function PartyPinPreview({ ariaLabel, label, pin }: PartyPinPreviewProps) {
  return <PinCodePreview ariaLabel={ariaLabel} label={label} value={pin} />;
}
