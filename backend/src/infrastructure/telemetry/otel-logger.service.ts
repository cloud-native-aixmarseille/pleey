import { Injectable, type LoggerService, Scope } from '@nestjs/common';
import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { loggerProvider } from './otel.config';

/**
 * OpenTelemetry-compliant Logger Service
 * Implements NestJS LoggerService interface with OpenTelemetry logging
 */
@Injectable({ scope: Scope.TRANSIENT })
export class OtelLoggerService implements LoggerService {
  private logger = loggerProvider.getLogger('quiz-backend-logger', '1.0.0');
  private contextName = 'Application';

  setContext(context: string): void {
    this.contextName = context;
  }

  /**
   * Write a log message
   */
  log(message: string, context?: string): void {
    this.emit('INFO', message, context);
  }

  /**
   * Write an error message
   */
  error(message: string, trace?: string, context?: string): void {
    this.emit('ERROR', message, context, { trace, error: true });
  }

  /**
   * Write a warning message
   */
  warn(message: string, context?: string): void {
    this.emit('WARN', message, context);
  }

  /**
   * Write a debug message
   */
  debug(message: string, context?: string): void {
    this.emit('DEBUG', message, context);
  }

  /**
   * Write a verbose message
   */
  verbose(message: string, context?: string): void {
    this.emit('TRACE', message, context);
  }

  /**
   * Emit a log record with OpenTelemetry
   */
  private emit(
    severityText: string,
    body: string,
    logContext?: string,
    attributes?: Record<string, unknown>,
  ): void {
    const contextToUse = logContext || this.contextName;
    const span = trace.getActiveSpan();

    const severityNumber = this.getSeverityNumber(severityText);

    // Build log attributes
    const logAttributes: Record<string, unknown> = {
      'log.context': contextToUse,
      'service.name': 'quiz-backend',
      ...attributes,
    };

    // Add span context if available
    if (span) {
      const spanContext = span.spanContext();
      logAttributes.trace_id = spanContext.traceId;
      logAttributes.span_id = spanContext.spanId;
      logAttributes.trace_flags = spanContext.traceFlags;
    }

    // Emit the log record
    this.logger.emit({
      severityNumber,
      severityText,
      body,
      attributes: logAttributes,
      timestamp: Date.now(),
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      const color = this.getConsoleColor(severityText);
      console.log(`${color}[${timestamp}] [${severityText}] [${contextToUse}]${'\x1b[0m'} ${body}`);
    }
  }

  /**
   * Get OpenTelemetry severity number from text
   */
  private getSeverityNumber(severityText: string): SeverityNumber {
    switch (severityText) {
      case 'TRACE':
        return SeverityNumber.TRACE;
      case 'DEBUG':
        return SeverityNumber.DEBUG;
      case 'INFO':
        return SeverityNumber.INFO;
      case 'WARN':
        return SeverityNumber.WARN;
      case 'ERROR':
        return SeverityNumber.ERROR;
      case 'FATAL':
        return SeverityNumber.FATAL;
      default:
        return SeverityNumber.INFO;
    }
  }

  /**
   * Get console color for severity level
   */
  private getConsoleColor(severityText: string): string {
    switch (severityText) {
      case 'ERROR':
      case 'FATAL':
        return '\x1b[31m'; // Red
      case 'WARN':
        return '\x1b[33m'; // Yellow
      case 'INFO':
        return '\x1b[32m'; // Green
      case 'DEBUG':
        return '\x1b[36m'; // Cyan
      case 'TRACE':
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[0m'; // Default
    }
  }

  /**
   * Create a traced operation with automatic span management
   */
  async traceOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    attributes?: Record<string, unknown>,
  ): Promise<T> {
    const tracer = trace.getTracer('quiz-backend-tracer', '1.0.0');
    const span = tracer.startSpan(operationName, {
      attributes: {
        'operation.name': operationName,
        ...attributes,
      },
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        this.debug(`Starting operation: ${operationName}`);
        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        this.debug(`Completed operation: ${operationName}`);
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        this.error(
          `Error in operation: ${operationName}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
