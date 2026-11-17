import { useEffect, useState } from 'react';
import { usePresentationTranslation } from '../i18n/use-presentation-translation';
import { IconTriggerButton } from '../ui/actions/icon-trigger-button';
import { StatusBanner } from '../ui/feedback/status-banner';
import { AppIcon } from '../ui/icons/app-icon';
import { Tooltip } from '../ui/overlay/tooltip';
import { useGuide } from './guide-context';

export function GuideLaunch({ guideId }: { readonly guideId: string }) {
  const facade = useGuide();
  const { t } = usePresentationTranslation();
  const [requestedGuideId] = useState(() => new URLSearchParams(window.location.search).get('guide'));
  const [completed, setCompleted] = useState(() => facade.isCompleted(guideId));
  const [unavailable, setUnavailable] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  useEffect(() => {
    if (requestedGuideId !== guideId) return;
    const launch = () => {
      if (!facade.startTour(guideId, () => setCompleted(true))) return false;
      setTooltipDismissed(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('guide');
      window.history.replaceState(window.history.state, '', url);
      return true;
    };
    if (launch()) return;
    const observer = new MutationObserver(() => {
      if (launch()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [facade, guideId, requestedGuideId]);
  useEffect(() => () => facade.stopTour(), [facade]);
  const label = t(completed ? 'shared.guide.replay' : 'shared.guide.start');
  return (
    <>
      <Tooltip disabled={tooltipDismissed} label={label}>
        <IconTriggerButton
          aria-label={label}
          data-guide={guideId}
          h="2.75rem"
          minWidth="2.75rem"
          paddingX="0"
          onMouseEnter={() => setTooltipDismissed(false)}
          onClick={() => {
            // The tooltip's Escape handler must not intercept the tour's keyboard controls.
            setTooltipDismissed(true);
            setUnavailable(!facade.startTour(guideId, () => setCompleted(true)));
          }}
        >
          <AppIcon name="help" size={20} />
        </IconTriggerButton>
      </Tooltip>
      {unavailable ? <StatusBanner tone="info">{t('shared.guide.unavailable')}</StatusBanner> : null}
    </>
  );
}
