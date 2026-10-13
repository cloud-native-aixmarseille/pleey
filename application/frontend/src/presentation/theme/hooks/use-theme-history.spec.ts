import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { useThemeHistory } from './use-theme-history';

const fixtures = new ThemeFixtureFactory();
describe('useThemeHistory', () => {
  it('coalesces continuous typing into one undo step', () => {
    // Arrange
    const initial = fixtures.createDocument();
    const change = vi.fn();
    const { result } = renderHook(() => useThemeHistory(initial, change));
    // Act
    act(() => {
      result.current.change({ ...initial, name: 'A' }, 'name');
      result.current.change({ ...initial, name: 'AB' }, 'name');
      result.current.undo();
    });
    // Assert
    expect(change).toHaveBeenLastCalledWith(initial);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });
  it('restores the selected draft through redo', () => {
    // Arrange
    const initial = fixtures.createDocument();
    const next = { ...initial, name: 'Changed' };
    const change = vi.fn();
    const { result } = renderHook(() => useThemeHistory(initial, change));
    // Act
    act(() => {
      result.current.change(next);
      result.current.undo();
      result.current.redo();
    });
    // Assert
    expect(change).toHaveBeenLastCalledWith(next);
  });
  it('drops stale redo history when a user takes a new direction', () => {
    // Arrange
    const initial = fixtures.createDocument();
    const change = vi.fn();
    const { result } = renderHook(() => useThemeHistory(initial, change));
    // Act
    act(() => {
      result.current.change({ ...initial, name: 'First' });
      result.current.undo();
      result.current.change({ ...initial, name: 'Second' });
    });
    // Assert
    expect(result.current.canRedo).toBe(false);
    expect(change).toHaveBeenLastCalledWith({ ...initial, name: 'Second' });
  });
});
