import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { PartyStageFixtureFactory } from '../../../../../../../test-utils/fixtures/party-stage-fixture-factory';
import { useStageTiming } from './use-stage-timing';

const fixtures = new PartyStageFixtureFactory();

describe('useStageTiming', () => {
  it.each([
    { now: 100_000, isReading: true, remaining: 20_000 },
    { now: 102_999, isReading: true, remaining: 20_000 },
    { now: 103_000, isReading: false, remaining: 20_000 },
    { now: 108_000, isReading: false, remaining: 15_000 },
    { now: 123_000, isReading: false, remaining: 0 },
  ])('derives the current reading and answering interval on mount at $now', ({ now, isReading, remaining }) => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const party = fixtures.createObservation();
    // Act + Assert
    try {
      // Act
      const { result } = renderHook(() => useStageTiming(party));
      // Assert
      expect(result.current).toEqual({ isReading, remainingDurationMs: remaining, totalDurationMs: 20_000 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('finishes reading at its deadline for an untimed stage', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
    const party = fixtures.createObservation({
      stageEndsAtEpochMs: null,
      stageTimeLimitSeconds: 0,
      stageRemainingDurationMs: null,
    });
    const { result } = renderHook(() => useStageTiming(party));
    // Act + Assert
    try {
      // Act
      act(() => vi.advanceTimersByTime(3_000));
      // Assert
      expect(result.current).toEqual({ isReading: false, remainingDurationMs: null, totalDurationMs: null });
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps reading frozen while paused', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
    const party = fixtures.createObservation(
      { reading: { endsAtEpochMs: null, remainingDurationMs: 2_000 }, stageEndsAtEpochMs: null },
      { status: PartyStatus.PAUSED },
    );
    const { result, rerender } = renderHook(() => useStageTiming(party));
    // Act + Assert
    try {
      // Act
      act(() => vi.advanceTimersByTime(60_000));
      rerender();
      // Assert
      expect(result.current).toEqual({ isReading: true, remainingDurationMs: 20_000, totalDurationMs: 20_000 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses a resumed reading deadline without restarting the configured delay', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(200_000);
    const paused = fixtures.createObservation(
      { reading: { endsAtEpochMs: null, remainingDurationMs: 2_000 }, stageEndsAtEpochMs: null },
      { status: PartyStatus.PAUSED },
    );
    const resumed = fixtures.createObservation({
      reading: { endsAtEpochMs: 202_000, remainingDurationMs: 2_000 },
      stageEndsAtEpochMs: 222_000,
    });
    const { result, rerender } = renderHook(({ party }) => useStageTiming(party), { initialProps: { party: paused } });
    // Act + Assert
    try {
      // Act
      rerender({ party: resumed });
      act(() => vi.advanceTimersByTime(2_000));
      // Assert
      expect(result.current).toEqual({ isReading: false, remainingDurationMs: 20_000, totalDurationMs: 20_000 });
    } finally {
      vi.useRealTimers();
    }
  });
});
