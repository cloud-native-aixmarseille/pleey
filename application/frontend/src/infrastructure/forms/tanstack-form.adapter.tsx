import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import type {
  FormPort,
  PresentationFieldApi,
  PresentationFormApi,
  PresentationFormContextApi,
  PresentationUseFormOptions,
} from '../../application/shared/contracts/form.port';

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

export class TanstackFormAdapter {
  createPort(): FormPort {
    return {
      useForm: <TValues extends Record<string, unknown>>(
        options: PresentationUseFormOptions<TValues>,
      ) => useAppForm(options) as PresentationFormApi<TValues>,
      useFieldContext: <TValue = string>() =>
        useFieldContext<TValue>() as PresentationFieldApi<TValue>,
      useFormContext: () => useFormContext() as PresentationFormContextApi,
    };
  }
}
