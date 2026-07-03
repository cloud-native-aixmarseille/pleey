import { createConnection } from 'node:net';
import process from 'node:process';
import { URL } from 'node:url';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export type OpenTelemetryConfig = {
  consoleDiagnosticsEnabled: boolean;
  consoleExportersEnabled: boolean;
  consoleLogsEnabled: boolean;
  endpoint?: string;
  environment: string;
  headersJson?: string;
};

const DEFAULT_TELEMETRY_CONFIG: OpenTelemetryConfig = {
  consoleDiagnosticsEnabled: false,
  consoleExportersEnabled: false,
  consoleLogsEnabled: false,
  environment: 'development',
};

let telemetryConfig: OpenTelemetryConfig = DEFAULT_TELEMETRY_CONFIG;

function createResource(config: OpenTelemetryConfig) {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'quiz-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    environment: config.environment,
  });
}

function createLoggerProvider(
  logExporter?: OTLPLogExporter | ConsoleLogRecordExporter,
): LoggerProvider {
  return new LoggerProvider({
    resource,
    processors: logExporter
      ? [
          new BatchLogRecordProcessor({
            exporter: logExporter,
          }),
        ]
      : [],
  });
}

/**
 * OpenTelemetry Configuration
 * Sets up tracing, metrics, and logging for the application
 */
let resource = createResource(telemetryConfig);

// Configure Logger Provider
let loggerProvider = createLoggerProvider();
let otelSDK: NodeSDK | null = null;

let shutdownHookRegistered = false;

export function getLoggerProvider(): LoggerProvider {
  return loggerProvider;
}

export function isTelemetryConsoleLoggingEnabled(): boolean {
  return telemetryConfig.consoleLogsEnabled;
}

function applyTelemetryConfig(config: OpenTelemetryConfig): void {
  telemetryConfig = config;
  resource = createResource(config);
  loggerProvider = createLoggerProvider();
}

function parseHeaders(headersJson?: string): Record<string, string> | undefined {
  if (!headersJson) return undefined;

  try {
    return JSON.parse(headersJson) as Record<string, string>;
  } catch (error: unknown) {
    console.warn('[Telemetry] Failed to parse OTEL_EXPORTER_OTLP_HEADERS, ignoring value.', error);
    return undefined;
  }
}

async function isEndpointReachable(endpoint: string): Promise<boolean> {
  try {
    const target = new URL(endpoint);
    const port = target.port ? Number(target.port) : 4318;

    return await new Promise((resolve) => {
      const socket = createConnection({ host: target.hostname, port, timeout: 2000 }, () => {
        socket.end();
        resolve(true);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    console.warn(
      '[Telemetry] Invalid OTLP endpoint provided, using console exporters instead.',
      error,
    );
    return false;
  }
}

function buildExporters(useConsoleExporters: boolean, endpoint?: string, headersJson?: string) {
  if (!useConsoleExporters && !endpoint) {
    return {};
  }

  const headers = endpoint ? parseHeaders(headersJson) : undefined;

  const traceExporter =
    !useConsoleExporters && endpoint
      ? new OTLPTraceExporter({
          url: `${endpoint}/v1/traces`,
          headers,
        })
      : undefined;

  const metricExporter =
    !useConsoleExporters && endpoint
      ? new OTLPMetricExporter({
          url: `${endpoint}/v1/metrics`,
          headers,
        })
      : useConsoleExporters
        ? new ConsoleMetricExporter()
        : undefined;

  const logExporter =
    !useConsoleExporters && endpoint
      ? new OTLPLogExporter({
          url: `${endpoint}/v1/logs`,
          headers,
        })
      : useConsoleExporters
        ? new ConsoleLogRecordExporter()
        : undefined;

  return { traceExporter, metricExporter, logExporter };
}

/**
 * Initialize OpenTelemetry SDK
 * Should be called before any other application code
 */
export async function initializeOpenTelemetry(config: OpenTelemetryConfig): Promise<void> {
  if (otelSDK) {
    return;
  }

  applyTelemetryConfig(config);

  if (config.consoleDiagnosticsEnabled) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }

  const endpoint = config.endpoint?.trim();
  let useConsoleExporters = !endpoint && config.consoleExportersEnabled;

  if (endpoint && !(await isEndpointReachable(endpoint))) {
    if (config.consoleExportersEnabled) {
      console.warn(
        `[Telemetry] Unable to reach OTLP endpoint ${endpoint}. Falling back to console exporters.`,
      );
      useConsoleExporters = true;
    } else {
      console.warn(
        `[Telemetry] Unable to reach OTLP endpoint ${endpoint}. Telemetry exporters are disabled.`,
      );
    }
  }

  const activeEndpoint = useConsoleExporters ? undefined : endpoint;

  const { traceExporter, metricExporter, logExporter } = buildExporters(
    useConsoleExporters,
    activeEndpoint,
    config.headersJson,
  );

  loggerProvider = createLoggerProvider(logExporter);

  otelSDK = new NodeSDK({
    resource,
    traceExporter,
    metricReaders: metricExporter
      ? [
          new PeriodicExportingMetricReader({
            exporter: metricExporter,
            exportIntervalMillis: 60000,
          }),
        ]
      : [],
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  await otelSDK.start();

  if (!shutdownHookRegistered) {
    process.on('SIGTERM', () => {
      if (!otelSDK) return;
      otelSDK
        .shutdown()
        .catch((error: unknown) => console.error('Error shutting down OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });
    shutdownHookRegistered = true;
  }
}
