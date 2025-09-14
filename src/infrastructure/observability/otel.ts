// Configuração do OpenTelemetry para Bun.js + Elysia
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

// Configuração do OpenTelemetry para Payment API
export function initializeOpenTelemetry() {
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'payment-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'payment-system',
  });

  // Exportador de traces para OpenTelemetry Collector (HTTP)
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://otel-collector:4318/v1/traces',
  });

  // Exportador de métricas para OpenTelemetry Collector (HTTP)
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://otel-collector:4318/v1/metrics',
  });

  // Configuração do SDK para Bun.js + Elysia
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000, // Exporta métricas a cada 30 segundos
    }),
    // Instrumentações específicas para Bun.js
    instrumentations: [
      // Usar instrumentações automáticas com configurações específicas
      getNodeAutoInstrumentations({
        // Desabilitar instrumentações que não funcionam bem com Bun
        '@opentelemetry/instrumentation-fs': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: true,
        },
        // Manter instrumentação HTTP ativa
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            const url = (request as any).url || (request as any).path || '';
            span.setAttributes({
              'http.url': url,
              'http.method': (request as any).method || 'GET',
            });
          },
          responseHook: (span, response) => {
            span.setAttributes({
              'http.status_code': (response as any).statusCode || 200,
            });
          },
        },
      }),
    ],
  });

  // Inicializar o SDK
  sdk.start();

  console.log('🔍 OpenTelemetry inicializado com sucesso!');
  console.log('📊 Traces serão enviados para:', process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://otel-collector:4318/v1/traces');
  console.log('📈 Métricas serão enviadas para:', process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://otel-collector:4318/v1/metrics');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('🔍 OpenTelemetry finalizado com sucesso'))
      .catch((error) => console.error('❌ Erro ao finalizar OpenTelemetry:', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}
