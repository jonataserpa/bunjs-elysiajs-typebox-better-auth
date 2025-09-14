import { Elysia } from 'elysia';
import { trace } from '@opentelemetry/api';

export const otelTracingMiddleware = new Elysia({ name: 'otel-tracing' })
  .derive(({ request, set }) => {
    const tracer = trace.getTracer('payment-api-http');
    const span = tracer.startSpan(`${request.method} ${request.url}`, {
      attributes: {
        'http.method': request.method,
        'http.url': request.url,
        'http.scheme': 'http',
        'http.host': 'localhost:3000',
        'http.user_agent': request.headers.get('user-agent') || 'unknown',
      },
    });

    // Armazenar o span no contexto
    (set as any).otelSpan = span;
    
    return {
      otelSpan: span
    };
  })
  .onAfterHandle(({ set, otelSpan }) => {
    if (otelSpan) {
      otelSpan.setAttributes({
        'http.status_code': set.status || 200,
      });
      otelSpan.end();
    }
  })
  .onError(({ set, error, otelSpan }) => {
    if (otelSpan) {
      otelSpan.recordException(error);
      otelSpan.setAttributes({
        'http.status_code': set.status || 500,
        'error': true,
        'error.message': error.message,
      });
      otelSpan.end();
    }
  });
