import { AppConfiguration } from './app-configuration';
import { AppEnvironment } from './app-environment';
import type { AppRuntimeConfiguration } from './app-runtime-configuration.token';

export function loadAppRuntimeConfiguration(values?: NodeJS.ProcessEnv): AppRuntimeConfiguration {
  const environment = new AppEnvironment(values);
  const configuration = new AppConfiguration(environment);

  return configuration.getRuntimeConfiguration();
}
