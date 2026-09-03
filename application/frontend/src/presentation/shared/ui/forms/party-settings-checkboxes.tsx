import type { PartySettings } from '../../../../domains/game/party/shared/entities/party-settings';
import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { Checkbox } from './checkbox';

interface PartySettingsCheckboxesProps {
  readonly disabled?: boolean;
  readonly idPrefix: string;
  readonly settings: PartySettings;
  readonly translationKeyPrefix: string;
  readonly onChange: (settings: PartySettings) => void;
}

export function PartySettingsCheckboxes({
  disabled,
  idPrefix,
  settings,
  translationKeyPrefix,
  onChange,
}: PartySettingsCheckboxesProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <Checkbox
        id={`${idPrefix}-allow-joining-after-start`}
        label={t(`${translationKeyPrefix}.allowJoiningAfterStartLabel`)}
        description={t(`${translationKeyPrefix}.allowJoiningAfterStartDescription`)}
        checked={settings.allowJoiningAfterStart}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, allowJoiningAfterStart: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-allow-option-change-after-voting`}
        label={t(`${translationKeyPrefix}.allowOptionChangeAfterVotingLabel`)}
        description={t(`${translationKeyPrefix}.allowOptionChangeAfterVotingDescription`)}
        checked={settings.allowOptionChangeAfterVoting}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, allowOptionChangeAfterVoting: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-randomize-stage-order`}
        label={t(`${translationKeyPrefix}.randomizeStageOrderLabel`)}
        description={t(`${translationKeyPrefix}.randomizeStageOrderDescription`)}
        checked={settings.randomizeStageOrder}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, randomizeStageOrder: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-randomize-option-order`}
        label={t(`${translationKeyPrefix}.randomizeOptionOrderLabel`)}
        description={t(`${translationKeyPrefix}.randomizeOptionOrderDescription`)}
        checked={settings.randomizeOptionOrder}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, randomizeOptionOrder: event.currentTarget.checked })}
      />
    </>
  );
}
