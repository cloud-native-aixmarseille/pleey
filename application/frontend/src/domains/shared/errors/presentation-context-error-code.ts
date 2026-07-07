import { type DomainErrorDefinition } from './domain-error';

export enum PresentationContextErrorCode {
  AUTH_PROVIDER_REQUIRED = 'AUTH_PROVIDER_REQUIRED',
  PARTY_PROVIDER_REQUIRED = 'PARTY_PROVIDER_REQUIRED',
  PRESENTATION_FORM_PROVIDER_REQUIRED = 'PRESENTATION_FORM_PROVIDER_REQUIRED',
  PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED = 'PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED',
  PRESENTATION_ROUTING_PROVIDER_REQUIRED = 'PRESENTATION_ROUTING_PROVIDER_REQUIRED',
  PRESENTATION_TOAST_PROVIDER_REQUIRED = 'PRESENTATION_TOAST_PROVIDER_REQUIRED',
  PRESENTATION_TRANSLATION_PROVIDER_REQUIRED = 'PRESENTATION_TRANSLATION_PROVIDER_REQUIRED',
  PRESENTATION_UI_PROVIDER_REQUIRED = 'PRESENTATION_UI_PROVIDER_REQUIRED',
}

export const PRESENTATION_CONTEXT_ERROR_DEFINITIONS: Readonly<
  Record<PresentationContextErrorCode, DomainErrorDefinition<PresentationContextErrorCode>>
> = {
  [PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED,
    message: 'AUTH_PROVIDER_REQUIRED',
    messageKey: 'AUTH_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PARTY_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PARTY_PROVIDER_REQUIRED,
    message: 'PARTY_PROVIDER_REQUIRED',
    messageKey: 'PARTY_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_FORM_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_FORM_PROVIDER_REQUIRED,
    message: 'PRESENTATION_FORM_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_FORM_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
    message: 'PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_ROUTING_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_ROUTING_PROVIDER_REQUIRED,
    message: 'PRESENTATION_ROUTING_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_ROUTING_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_TOAST_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_TOAST_PROVIDER_REQUIRED,
    message: 'PRESENTATION_TOAST_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_TOAST_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_TRANSLATION_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_TRANSLATION_PROVIDER_REQUIRED,
    message: 'PRESENTATION_TRANSLATION_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_TRANSLATION_PROVIDER_REQUIRED',
  },
  [PresentationContextErrorCode.PRESENTATION_UI_PROVIDER_REQUIRED]: {
    code: PresentationContextErrorCode.PRESENTATION_UI_PROVIDER_REQUIRED,
    message: 'PRESENTATION_UI_PROVIDER_REQUIRED',
    messageKey: 'PRESENTATION_UI_PROVIDER_REQUIRED',
  },
};

export { AuthProviderRequiredError } from './auth-provider-required-error';
export { PartyProviderRequiredError } from './party-provider-required-error';
export { PresentationFormProviderRequiredError } from './presentation-form-provider-required-error';
export { PresentationRoutingProviderRequiredError } from './presentation-routing-provider-required-error';
export { PresentationRuntimeDependencyProviderRequiredError } from './presentation-runtime-dependency-provider-required-error';
export { PresentationToastProviderRequiredError } from './presentation-toast-provider-required-error';
export { PresentationTranslationProviderRequiredError } from './presentation-translation-provider-required-error';
export { PresentationUiProviderRequiredError } from './presentation-ui-provider-required-error';
