import type { DomainErrorDefinition } from './domain-error';

export enum AppBootstrapErrorCode {
  ROOT_ELEMENT_NOT_FOUND = 'ROOT_ELEMENT_NOT_FOUND',
}

export const APP_BOOTSTRAP_ERROR_DEFINITIONS: Readonly<
  Record<AppBootstrapErrorCode, DomainErrorDefinition<AppBootstrapErrorCode>>
> = {
  [AppBootstrapErrorCode.ROOT_ELEMENT_NOT_FOUND]: {
    code: AppBootstrapErrorCode.ROOT_ELEMENT_NOT_FOUND,
    message: 'ROOT_ELEMENT_NOT_FOUND',
    messageKey: 'ROOT_ELEMENT_NOT_FOUND',
  },
};

export { RootElementNotFoundError } from './root-element-not-found-error';
