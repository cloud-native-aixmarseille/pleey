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

// Configure OTLP exporters (use console exporters if OTLP endpoint not configured)
const useConsoleExporters = !process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const traceExporter = useConsoleExporters
  ? undefined // Let SDK use default console exporter
  : new OTLPTraceExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
        ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
        : {},
    });

const metricExporter = useConsoleExporters
  ? new ConsoleMetricExporter()
  : new OTLPMetricExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
        ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
        : {},
    });

const logExporter = useConsoleExporters
  ? new ConsoleLogRecordExporter()
  : new OTLPLogExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
        ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
        : {},
    });

// Configure Logger Provider
export const loggerProvider = new LoggerProvider({
  resource,
});

// Cast to any to avoid TypeScript issues with changing API
(loggerProvider as any).addLogRecordProcessor?.(new BatchLogRecordProcessor(logExporter));

// Configure and initialize OpenTelemetry SDK
export const otelSDK = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // Export every 60 seconds
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable instrumentations that might cause issues
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

/**
 * Initialize OpenTelemetry SDK
 * Should be called before any other application code
 */
export function initializeOpenTelemetry(): void {
  otelSDK.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    otelSDK
      .shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down successfully'))
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
}
