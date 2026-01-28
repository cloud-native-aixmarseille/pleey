import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useConfirmDialog } from './use-confirm-dialog';

describe('useConfirmDialog', () => {
  it('starts in closed state', () => {
    const { result } = renderHook(() => useConfirmDialog());

    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.dialogState.message).toBe('');
  });

  it('opens dialog with message on requestConfirmation', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.requestConfirmation('Delete this?');
    });

    expect(result.current.dialogState.isOpen).toBe(true);
    expect(result.current.dialogState.message).toBe('Delete this?');

    act(() => {
      result.current.cancel();
    });

    expect(await promise!).toBe(false);
  });

  it('resolves true on confirm', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.requestConfirmation('Proceed?');
    });

    act(() => {
      result.current.confirm();
    });

    expect(await promise!).toBe(true);
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it('resolves false on cancel', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.requestConfirmation('Proceed?');
    });

    act(() => {
      result.current.cancel();
    });

    expect(await promise!).toBe(false);
    expect(result.current.dialogState.isOpen).toBe(false);
  });
});
