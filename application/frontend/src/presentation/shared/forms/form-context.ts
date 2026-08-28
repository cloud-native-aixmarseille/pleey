import type { PresentationFieldApi, PresentationFormContextApi } from '../../../application/shared/ports/form.port';
import { usePresentationFormPort } from './form-provider';

export function useFieldContext<TValue = string>(): PresentationFieldApi<TValue> {
  return usePresentationFormPort().useFieldContext<TValue>();
}

export function useFormContext(): PresentationFormContextApi {
  return usePresentationFormPort().useFormContext();
}
