# OpenTelemetry Integration

This directory contains the OpenTelemetry infrastructure for the QuizMaster backend.

## Overview

The backend uses OpenTelemetry for:
- **Distributed Tracing**: Track requests across services
- **Metrics**: Monitor application performance and health
- **Logging**: Structured, correlated logging

## Features

- ✅ Automatic instrumentation of HTTP, database, and other operations
- ✅ Custom logger service compatible with NestJS
- ✅ Trace correlation with logs
- ✅ Console exporters (development) and OTLP exporters (production)
- ✅ Graceful shutdown handling

## Configuration

### Environment Variables

Configure OpenTelemetry exporters using environment variables:

```bash
# OTLP Endpoint (e.g., Jaeger, Grafana Tempo, or any OTLP-compatible backend)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Optional: Custom headers (e.g., for authentication)
OTEL_EXPORTER_OTLP_HEADERS='{"Authorization":"Bearer YOUR_TOKEN"}'

# Service name (optional, defaults to "quiz-backend")
OTEL_SERVICE_NAME=quiz-backend
```

If `OTEL_EXPORTER_OTLP_ENDPOINT` is not set, the application will use console exporters.

### Supported Backends

The OTLP HTTP exporter is compatible with:
- **Jaeger** (v1.35+)
- **Grafana Tempo**
- **Elastic APM**
- **Honeycomb**
- **New Relic**
- **Any OTLP-compatible backend**

## Usage

### Using the Logger

The `OtelLoggerService` is automatically configured as the application logger:

```typescript
import { Injectable } from '@nestjs/common';
import { OtelLoggerService } from '@infrastructure/telemetry';

@Injectable()
export class MyService {
  private readonly logger = new OtelLoggerService();

  constructor() {
    this.logger.setContext('MyService');
  }

  async myMethod() {
    this.logger.log('Starting operation');
    this.logger.debug('Debug information');
    this.logger.warn('Warning message');
    
    try {
      // Your code
    } catch (error) {
      this.logger.error('Error occurred', error.stack);
      throw error;
    }
  }
}
```

### Tracing Operations

Use the `traceOperation` method to automatically create spans:

```typescript
const result = await this.logger.traceOperation(
  'fetchUserData',
  async () => {
    return await this.userRepository.findById(userId);
  },
  { userId }
);
```

### Manual Tracing

For more control, use the OpenTelemetry API directly:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');
const span = tracer.startSpan('operation-name');

try {
  // Your code
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ code: SpanStatusCode.ERROR });
  span.recordException(error);
  throw error;
} finally {
  span.end();
}
```

## Log Correlation

Logs are automatically correlated with traces. When a log is emitted within a traced operation, it includes:
- `trace_id`: The trace identifier
- `span_id`: The current span identifier
- `trace_flags`: Trace flags

This allows you to:
1. Find all logs for a specific trace
2. Navigate from logs to traces and vice versa
3. Get full context when investigating issues

## Development

In development mode (`NODE_ENV=development`):
- Logs are printed to console with colors
- Diagnostic information is enabled
- Console exporters are used by default

## Production

In production:
- Logs are exported to the configured OTLP endpoint
- Console logging is minimal
- Batched export for better performance

## Example: Jaeger Setup

To test with Jaeger locally:

```bash
# Start Jaeger all-in-one
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Configure the backend
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Start the application
npm run start:dev

# View traces at http://localhost:16686
```

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://github.com/open-telemetry/opentelemetry-js)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
