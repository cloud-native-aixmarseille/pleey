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

/**
 * OpenTelemetry Configuration
 * Sets up tracing, metrics, and logging for the application
 */

// Enable diagnostic logging for OpenTelemetry (only in development)
if (process.env.NODE_ENV !== 'production') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

// Define service resource attributes
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'quiz-backend',
  [ATTR_SERVICE_VERSION]: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
});

// Configure Logger Provider
export const loggerProvider = new LoggerProvider({
  resource,
});
export let otelSDK: NodeSDK | null = null;

let logProcessorRegistered = false;
let shutdownHookRegistered = false;

function parseHeaders(): Record<string, string> | undefined {
  if (!process.env.OTEL_EXPORTER_OTLP_HEADERS) return undefined;

  try {
    return JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS);
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

function buildExporters(useConsoleExporters: boolean, endpoint?: string) {
  const headers = endpoint ? parseHeaders() : undefined;

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
      : new ConsoleMetricExporter();

  const logExporter =
    !useConsoleExporters && endpoint
      ? new OTLPLogExporter({
          url: `${endpoint}/v1/logs`,
          headers,
        })
      : new ConsoleLogRecordExporter();

  return { traceExporter, metricExporter, logExporter };
}

/**
 * Initialize OpenTelemetry SDK
 * Should be called before any other application code
 */
export async function initializeOpenTelemetry(): Promise<void> {
  if (otelSDK) {
    return;
  }

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
  let useConsoleExporters = !endpoint;

  if (endpoint && !(await isEndpointReachable(endpoint))) {
    console.warn(
      `[Telemetry] Unable to reach OTLP endpoint ${endpoint}. Falling back to console exporters.`,
    );
    useConsoleExporters = true;
  }

  const activeEndpoint = useConsoleExporters ? undefined : endpoint;

  const { traceExporter, metricExporter, logExporter } = buildExporters(
    useConsoleExporters,
    activeEndpoint,
  );

  if (!logProcessorRegistered) {
    const provider = loggerProvider as unknown as {
      addLogRecordProcessor?: unknown;
    };
    const maybeAddLogRecordProcessor = provider.addLogRecordProcessor;

    if (typeof maybeAddLogRecordProcessor === 'function') {
      (maybeAddLogRecordProcessor as (processor: BatchLogRecordProcessor) => void).call(
        loggerProvider,
        new BatchLogRecordProcessor(logExporter),
      );
      logProcessorRegistered = true;
    }
  }

  otelSDK = new NodeSDK({
    resource,
    traceExporter,
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 60000,
      }),
    ],
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
        .then(() => console.log('OpenTelemetry SDK shut down successfully'))
        .catch((error: unknown) => console.error('Error shutting down OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });
    shutdownHookRegistered = true;
  }
}
