import type {
  PresentationFormApi,
  PresentationUseFormOptions,
} from '../../../application/shared/contracts/form.port';
import { usePresentationFormPort } from './form-provider';

export function usePresentationForm<TValues extends Record<string, unknown>>(
  options: PresentationUseFormOptions<TValues>,
): PresentationFormApi<TValues> {
  return usePresentationFormPort().useForm(options);
}
