import { driver } from 'driver.js';
import { describe, expect, it, vi } from 'vitest';
import { GuideFixtureFactory } from '../../test-utils/fixtures/guide-fixture-factory';
import { GuideTourAdapter } from './guide-tour.adapter';

vi.mock('driver.js', () => ({ driver: vi.fn(() => ({ drive: vi.fn(), destroy: vi.fn() })) }));

describe('GuideTourAdapter', () => {
  it('resolves locale copy at launch and renders translations as text', () => {
    // Arrange
    const guide = new GuideFixtureFactory().create();
    const target = document.createElement('div');
    target.dataset.tour = 'workspace';
    document.body.append(target);
    const rects = vi.spyOn(target, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    const translation = {
      currentLanguage: 'fr',
      changeLanguage: vi.fn(),
      t: vi.fn((key: string) => (key === guide.steps[0]?.i18nKey ? '<b>Guide</b>' : key)),
    };
    const adapter = new GuideTourAdapter(translation);
    const finished = vi.fn();
    // Act
    const started = adapter.start(guide, finished);
    const config = vi.mocked(driver).mock.lastCall?.[0];
    // Assert
    expect(started).toBe(true);
    expect(config?.steps?.[0]?.popover?.description).toBe('&lt;b&gt;Guide&lt;/b&gt;');
    expect(finished).not.toHaveBeenCalled();
    rects.mockRestore();
    target.remove();
  });

  it('rejects an unavailable target', () => {
    // Arrange
    const adapter = new GuideTourAdapter({ currentLanguage: 'en', changeLanguage: vi.fn(), t: (key) => key });
    // Act
    const started = adapter.start(new GuideFixtureFactory().create(), vi.fn());
    // Assert
    expect(started).toBe(false);
  });
});
