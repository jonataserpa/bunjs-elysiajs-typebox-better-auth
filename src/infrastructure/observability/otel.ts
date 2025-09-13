import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configuração do OpenTelemetry para Payment API
export function initializeOpenTelemetry() {
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'payment-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'payment-system',
  });

  // Exportador de traces para OpenTelemetry Collector
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4317/v1/traces',
  });

  // Exportador de métricas para OpenTelemetry Collector
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4317/v1/metrics',
  });

  // Configuração do SDK
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000, // Exporta métricas a cada 10 segundos
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Desabilitar instrumentações que podem causar conflito
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        // Configurar instrumentações específicas
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            // Adicionar informações customizadas aos spans HTTP
            span.setAttributes({
              'http.request.headers.user-agent': request.getHeader('user-agent') as string,
              'http.request.headers.content-type': request.getHeader('content-type') as string,
            });
          },
          responseHook: (span, response) => {
            // Adicionar informações customizadas de resposta
            span.setAttributes({
              'http.response.status_code': response.statusCode,
              'http.response.headers.content-type': response.getHeader('content-type') as string,
            });
          },
        },
      }),
    ],
  });

  // Inicializar o SDK
  sdk.start();

  console.log('🔍 OpenTelemetry inicializado com sucesso!');
  console.log('📊 Traces serão enviados para:', process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4317/v1/traces');
  console.log('📈 Métricas serão enviadas para:', process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4317/v1/metrics');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('🔍 OpenTelemetry finalizado com sucesso'))
      .catch((error) => console.error('❌ Erro ao finalizar OpenTelemetry:', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}
