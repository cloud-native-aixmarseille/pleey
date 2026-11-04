import type { PartySettings } from '../../../../domains/game/party/shared/entities/party-settings';
import { usePresentationTranslation } from '../../i18n/use-presentation-translation';
import { Checkbox } from './checkbox';
import { FieldShell } from './field-shell';
import { Select } from './select';

const TRANSLATION_KEY_PREFIX = 'game.party.settings';

interface PartySettingsFieldsProps {
  readonly disabled?: boolean;
  readonly idPrefix: string;
  readonly settings: PartySettings;
  readonly onChange: (settings: PartySettings) => void;
}

export function PartySettingsFields({ disabled, idPrefix, settings, onChange }: PartySettingsFieldsProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <FieldShell
        id={`${idPrefix}-question-reading-time`}
        label={t(`${TRANSLATION_KEY_PREFIX}.questionReadingTimeLabel`)}
        description={t(`${TRANSLATION_KEY_PREFIX}.questionReadingTimeDescription`)}
        descriptionId={`${idPrefix}-question-reading-time-description`}
      >
        <Select
          id={`${idPrefix}-question-reading-time`}
          aria-describedby={`${idPrefix}-question-reading-time-description`}
          value={settings.questionReadingTimeSeconds}
          disabled={disabled}
          onChange={(event) => onChange({ ...settings, questionReadingTimeSeconds: Number(event.currentTarget.value) })}
        >
          {Array.from({ length: 31 }, (_, seconds) => (
            <option key={seconds} value={seconds}>
              {seconds}
            </option>
          ))}
        </Select>
      </FieldShell>
      <Checkbox
        id={`${idPrefix}-allow-joining-after-start`}
        label={t(`${TRANSLATION_KEY_PREFIX}.allowJoiningAfterStartLabel`)}
        description={t(`${TRANSLATION_KEY_PREFIX}.allowJoiningAfterStartDescription`)}
        checked={settings.allowJoiningAfterStart}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, allowJoiningAfterStart: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-allow-option-change-after-voting`}
        label={t(`${TRANSLATION_KEY_PREFIX}.allowOptionChangeAfterVotingLabel`)}
        description={t(`${TRANSLATION_KEY_PREFIX}.allowOptionChangeAfterVotingDescription`)}
        checked={settings.allowOptionChangeAfterVoting}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, allowOptionChangeAfterVoting: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-randomize-stage-order`}
        label={t(`${TRANSLATION_KEY_PREFIX}.randomizeStageOrderLabel`)}
        description={t(`${TRANSLATION_KEY_PREFIX}.randomizeStageOrderDescription`)}
        checked={settings.randomizeStageOrder}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, randomizeStageOrder: event.currentTarget.checked })}
      />
      <Checkbox
        id={`${idPrefix}-randomize-option-order`}
        label={t(`${TRANSLATION_KEY_PREFIX}.randomizeOptionOrderLabel`)}
        description={t(`${TRANSLATION_KEY_PREFIX}.randomizeOptionOrderDescription`)}
        checked={settings.randomizeOptionOrder}
        disabled={disabled}
        onChange={(event) => onChange({ ...settings, randomizeOptionOrder: event.currentTarget.checked })}
      />
    </>
  );
}
