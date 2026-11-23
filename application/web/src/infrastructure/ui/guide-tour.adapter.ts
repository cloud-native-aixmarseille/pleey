import { type Driver, driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './guide-tour.css';
import { inject, injectable } from 'inversify';
import { type TranslationPort, TranslationPortToken } from '../../application/shared/ports/translation.port';
import type { GuideDefinition, GuideTourPort } from '../../domains/guide/ports/guide-tour.port';

@injectable()
export class GuideTourAdapter implements GuideTourPort {
  private active: Driver | null = null;

  constructor(@inject(TranslationPortToken) private readonly translation: TranslationPort) {}

  start(guide: GuideDefinition, onComplete: () => void): boolean {
    const elements = guide.steps.map((step) => document.querySelectorAll(`[data-tour="${step.anchor}"]`));
    if (
      elements.some(
        (matches) =>
          matches.length !== 1 || !(matches[0] instanceof HTMLElement) || matches[0].getClientRects().length === 0,
      )
    )
      return false;
    this.stop();
    const previousFocus = document.activeElement;
    const t = (key: string) => this.translation.t(key);
    const escapeText = (value: string) => {
      const element = document.createElement('span');
      element.textContent = value;
      return element.innerHTML;
    };
    const localePath = this.translation.currentLanguage.startsWith('fr') ? 'fr/' : '';
    const tour = driver({
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      allowClose: true,
      disableActiveInteraction: true,
      showProgress: true,
      progressText: t('shared.guide.progress'),
      nextBtnText: t('shared.guide.next'),
      prevBtnText: t('shared.guide.previous'),
      doneBtnText: t('shared.guide.done'),
      popoverClass: 'pleey-guide',
      steps: guide.steps.map((step, index) => ({
        element: elements[index]?.[0],
        popover: {
          title: escapeText(t(step.titleKey)),
          description: escapeText(t(step.i18nKey)),
          onPopoverRender: (popover) => {
            popover.closeButton.setAttribute('aria-label', t('shared.guide.close'));
            popover.wrapper.insertBefore(popover.progress, popover.title);
            const link = document.createElement('a');
            link.className = 'pleey-guide-reference';
            link.href = `https://github.com/cloud-native-aixmarseille/pleey/blob/main/docs/usage/${localePath}${guide.docPath}#${step.docAnchor}`;
            link.textContent = t('shared.guide.reference');
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            popover.wrapper.insertBefore(link, popover.footer);
          },
        },
      })),
      onDoneClick: () => {
        onComplete();
        tour.destroy();
      },
      onDestroyed: () => {
        this.active = null;
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
      },
    });
    this.active = tour;
    tour.drive();
    return true;
  }

  stop(): void {
    this.active?.destroy();
    this.active = null;
  }
}
