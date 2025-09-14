import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api';

/**
 * Utilitário para criação de traces manuais
 */
export class TracingUtil {
  private static tracer = trace.getTracer('payment-api-manual');

  /**
   * Cria um span para uma operação HTTP
   */
  static createHttpSpan(
    operationName: string,
    method: string,
    path: string,
    attributes?: Record<string, string | number | boolean>
  ) {
    const span = this.tracer.startSpan(operationName, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': method,
        'http.route': path,
        'component': 'payment-api',
        'service.name': 'payment-api',
        ...attributes,
      },
    });

    return {
      span,
      setStatus: (statusCode: number, error?: Error) => {
        span.setAttributes({
          'http.status_code': statusCode,
        });

        if (statusCode >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error?.message || `HTTP ${statusCode}`,
          });
          if (error) {
            span.recordException(error);
          }
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }
      },
      addEvent: (name: string, attributes?: Record<string, any>) => {
        span.addEvent(name, attributes);
      },
      setAttributes: (attributes: Record<string, any>) => {
        span.setAttributes(attributes);
      },
      end: () => {
        span.end();
      },
    };
  }

  /**
   * Cria um span para operações de banco de dados
   */
  static createDbSpan(
    operation: string,
    table: string,
    attributes?: Record<string, string | number | boolean>
  ) {
    const span = this.tracer.startSpan(`db.${operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'db.system': 'postgresql',
        'db.operation': operation,
        'db.sql.table': table,
        'component': 'payment-api',
        ...attributes,
      },
    });

    return {
      span,
      setStatus: (success: boolean, error?: Error) => {
        if (success) {
          span.setStatus({ code: SpanStatusCode.OK });
        } else {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error?.message || 'Database operation failed',
          });
          if (error) {
            span.recordException(error);
          }
        }
      },
      addEvent: (name: string, attributes?: Record<string, any>) => {
        span.addEvent(name, attributes);
      },
      setAttributes: (attributes: Record<string, any>) => {
        span.setAttributes(attributes);
      },
      end: () => {
        span.end();
      },
    };
  }

  /**
   * Cria um span para operações de negócio
   */
  static createBusinessSpan(
    operationName: string,
    component: string,
    attributes?: Record<string, string | number | boolean>
  ) {
    const span = this.tracer.startSpan(operationName, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'component': component,
        'service.name': 'payment-api',
        ...attributes,
      },
    });

    return {
      span,
      setStatus: (success: boolean, error?: Error) => {
        if (success) {
          span.setStatus({ code: SpanStatusCode.OK });
        } else {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error?.message || 'Business operation failed',
          });
          if (error) {
            span.recordException(error);
          }
        }
      },
      addEvent: (name: string, attributes?: Record<string, any>) => {
        span.addEvent(name, attributes);
      },
      setAttributes: (attributes: Record<string, any>) => {
        span.setAttributes(attributes);
      },
      end: () => {
        span.end();
      },
    };
  }
}
