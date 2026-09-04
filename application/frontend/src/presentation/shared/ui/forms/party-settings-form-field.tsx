import type { PartySettings } from '../../../../domains/game/party/shared/entities/party-settings';
import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { FieldShell } from './field-shell';
import { PartySettingsCheckboxes } from './party-settings-checkboxes';

interface PartySettingsFormFieldProps {
  readonly disabled?: boolean;
  readonly id: string;
  readonly settings: PartySettings;
  readonly onChange: (settings: PartySettings) => void;
}

export function PartySettingsFormField({ disabled, id, settings, onChange }: PartySettingsFormFieldProps) {
  const { t } = usePresentationTranslation();

  return (
    <FieldShell id={id} label={t('game.party.settings.fieldLabel')}>
      <PartySettingsCheckboxes idPrefix={id} settings={settings} disabled={disabled} onChange={onChange} />
    </FieldShell>
  );
}
