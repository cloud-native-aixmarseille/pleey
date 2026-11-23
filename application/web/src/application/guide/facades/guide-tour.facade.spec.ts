import { describe, expect, it, vi } from 'vitest';
import { GuideFixtureFactory } from '../../../test-utils/fixtures/guide-fixture-factory';
import { StoragePortMockFactory } from '../../../test-utils/mocks/storage-port-mock-factory';
import { GuideTourFacade } from './guide-tour.facade';

const guide = new GuideFixtureFactory().create();
describe('GuideTourFacade', () => {
  it('does not persist completion when a tour is dismissed', () => {
    // Arrange
    const storage = new StoragePortMockFactory().create();
    const tour = { start: vi.fn(() => true), stop: vi.fn() };
    const facade = new GuideTourFacade([guide], tour, storage);
    const completed = vi.fn();
    // Act
    facade.startTour(guide.id, completed);
    facade.stopTour();
    // Assert
    expect(facade.isCompleted(guide.id)).toBe(false);
    expect(completed).not.toHaveBeenCalled();
  });

  it('restores completion across instances and allows replay', () => {
    // Arrange
    const storage = new StoragePortMockFactory().create();
    const tour = {
      start: vi.fn((_guide, finish: () => void) => {
        finish();
        return true;
      }),
      stop: vi.fn(),
    };
    const facade = new GuideTourFacade([guide], tour, storage);
    // Act
    facade.startTour(guide.id, vi.fn());
    const restored = new GuideTourFacade([guide], tour, storage);
    const replay = restored.startTour(guide.id, vi.fn());
    // Assert
    expect(restored.isCompleted(guide.id)).toBe(true);
    expect(replay).toBe(true);
  });

  it('rejects unknown guides without invoking the renderer', () => {
    // Arrange
    const tour = { start: vi.fn(), stop: vi.fn() };
    const facade = new GuideTourFacade([guide], tour, new StoragePortMockFactory().create());
    // Act
    const started = facade.startTour('missing', vi.fn());
    // Assert
    expect(started).toBe(false);
    expect(tour.start).not.toHaveBeenCalled();
  });
});
