import type { ComponentType, HTMLInputTypeAttribute, PropsWithChildren, ReactNode } from 'react';

interface PresentationFieldMeta {
  readonly isTouched: boolean;
  readonly errors: readonly unknown[];
  readonly isValidating?: boolean;
}

interface PresentationFieldState<TValue> {
  readonly value: TValue;
  readonly meta: PresentationFieldMeta;
}

export interface PresentationFieldApi<TValue = string> {
  readonly name: string;
  readonly state: PresentationFieldState<TValue>;
  handleBlur(): void;
  handleChange(value: TValue): void;
}

interface PresentationFormState {
  readonly isSubmitting: boolean;
}

interface PresentationFormSubscribeProps<TSelected = boolean> {
  readonly selector: (state: PresentationFormState) => TSelected;
  readonly children: (selected: TSelected) => ReactNode;
}

export interface PresentationFormContextApi {
  readonly Subscribe: ComponentType<PresentationFormSubscribeProps>;
}

interface PresentationFormValidatorContext<TValue> {
  readonly value: TValue;
}

interface PresentationFormFieldValidators<TValue> {
  readonly onBlur?: (context: PresentationFormValidatorContext<TValue>) => string | undefined;
}

interface PresentationFormFieldProps<
  TValues extends Record<string, unknown>,
  TName extends keyof TValues & string,
> {
  readonly name: TName;
  readonly validators?: PresentationFormFieldValidators<TValues[TName]>;
  readonly children: () => ReactNode;
}

export interface PresentationUseFormOptions<TValues extends Record<string, unknown>> {
  readonly defaultValues: TValues;
  readonly onSubmit: (context: { readonly value: TValues }) => void | Promise<void>;
}

export interface PresentationFormApi<TValues extends Record<string, unknown>> {
  handleSubmit(): void | Promise<void>;
  reset(): void;
  AppForm: ComponentType<PropsWithChildren>;
  AppField: <TName extends keyof TValues & string>(
    props: PresentationFormFieldProps<TValues, TName>,
  ) => ReactNode;
}

export interface TextFormFieldProps {
  readonly label: string;
  readonly placeholder: string;
  readonly type?: HTMLInputTypeAttribute;
  readonly autoComplete?: string;
  readonly description?: string;
  readonly required?: boolean;
}

export interface SubmitButtonProps {
  readonly disabled?: boolean;
  readonly intent?: 'primary' | 'outline' | 'ghost';
  readonly size?: 'md' | 'sm';
  readonly width?: 'auto' | 'wide';
  readonly label: string;
  readonly submittingLabel?: string;
}

export interface FormPort {
  useForm<TValues extends Record<string, unknown>>(
    options: PresentationUseFormOptions<TValues>,
  ): PresentationFormApi<TValues>;
  useFieldContext<TValue = string>(): PresentationFieldApi<TValue>;
  useFormContext(): PresentationFormContextApi;
}
