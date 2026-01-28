import { useCallback, useState } from 'react';

interface ConfirmDialogState {
  readonly isOpen: boolean;
  readonly message: string;
}

interface UseConfirmDialogReturn {
  readonly dialogState: ConfirmDialogState;
  readonly requestConfirmation: (message: string) => Promise<boolean>;
  readonly confirm: () => void;
  readonly cancel: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    message: '',
  });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const requestConfirmation = useCallback((message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialogState({ isOpen: true, message });
      setResolver(() => resolve);
    });
  }, []);

  const confirm = useCallback(() => {
    resolver?.(true);
    setResolver(null);
    setDialogState({ isOpen: false, message: '' });
  }, [resolver]);

  const cancel = useCallback(() => {
    resolver?.(false);
    setResolver(null);
    setDialogState({ isOpen: false, message: '' });
  }, [resolver]);

  return { dialogState, requestConfirmation, confirm, cancel };
}
