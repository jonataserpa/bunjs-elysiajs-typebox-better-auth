import { metrics } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Obter o meter para criar métricas customizadas
const meter = metrics.getMeter('payment-api-metrics', '1.0.0');

// Contadores para pagamentos
export const paymentCounter = meter.createCounter('payments_total', {
  description: 'Total number of payments processed',
  unit: '1',
});

export const paymentAmountHistogram = meter.createHistogram('payment_amount', {
  description: 'Payment amounts in cents',
  unit: 'cent',
});

export const paymentDurationHistogram = meter.createHistogram('payment_duration_ms', {
  description: 'Payment processing duration in milliseconds',
  unit: 'ms',
});

// Contadores para transações
export const transactionCounter = meter.createCounter('transactions_total', {
  description: 'Total number of transactions processed',
  unit: '1',
});

export const transactionAmountHistogram = meter.createHistogram('transaction_amount', {
  description: 'Transaction amounts in cents',
  unit: 'cent',
});

// Contadores para tenants
export const tenantCounter = meter.createCounter('tenants_total', {
  description: 'Total number of tenant operations',
  unit: '1',
});

// Contadores para autenticação
export const authCounter = meter.createCounter('auth_attempts_total', {
  description: 'Total number of authentication attempts',
  unit: '1',
});

export const authSuccessCounter = meter.createCounter('auth_success_total', {
  description: 'Total number of successful authentications',
  unit: '1',
});

export const authFailureCounter = meter.createCounter('auth_failure_total', {
  description: 'Total number of failed authentications',
  unit: '1',
});

// Contadores para erros HTTP
export const httpErrorCounter = meter.createCounter('http_errors_total', {
  description: 'Total number of HTTP errors',
  unit: '1',
});

// Métricas de performance da API
export const apiResponseTimeHistogram = meter.createHistogram('api_response_time_ms', {
  description: 'API response time in milliseconds',
  unit: 'ms',
});

export const apiRequestCounter = meter.createCounter('api_requests_total', {
  description: 'Total number of API requests',
  unit: '1',
});

// Métricas de banco de dados
export const dbQueryDurationHistogram = meter.createHistogram('db_query_duration_ms', {
  description: 'Database query duration in milliseconds',
  unit: 'ms',
});

export const dbConnectionCounter = meter.createCounter('db_connections_total', {
  description: 'Total number of database connections',
  unit: '1',
});

// Métricas de memória e CPU (se necessário)
export const memoryUsageGauge = meter.createObservableGauge('memory_usage_bytes', {
  description: 'Memory usage in bytes',
  unit: 'bytes',
});

export const cpuUsageGauge = meter.createObservableGauge('cpu_usage_percent', {
  description: 'CPU usage percentage',
  unit: 'percent',
});

// Função para registrar métricas de pagamento
export function recordPaymentMetrics(amount: number, duration: number, status: string, provider: string, tenantId: string) {
  paymentCounter.add(1, {
    status,
    provider,
    tenant_id: tenantId,
  });

  paymentAmountHistogram.record(amount, {
    provider,
    tenant_id: tenantId,
  });

  paymentDurationHistogram.record(duration, {
    status,
    provider,
    tenant_id: tenantId,
  });
}

// Função para registrar métricas de transação
export function recordTransactionMetrics(amount: number, type: string, status: string, tenantId: string) {
  transactionCounter.add(1, {
    type,
    status,
    tenant_id: tenantId,
  });

  transactionAmountHistogram.record(amount, {
    type,
    status,
    tenant_id: tenantId,
  });
}

// Função para registrar métricas de autenticação
export function recordAuthMetrics(success: boolean, tenantId: string) {
  authCounter.add(1, {
    tenant_id: tenantId,
  });

  if (success) {
    authSuccessCounter.add(1, {
      tenant_id: tenantId,
    });
  } else {
    authFailureCounter.add(1, {
      tenant_id: tenantId,
    });
  }
}

// Função para registrar métricas de erro HTTP
export function recordHttpError(statusCode: number, method: string, path: string, tenantId?: string) {
  httpErrorCounter.add(1, {
    status_code: statusCode.toString(),
    method,
    path,
    tenant_id: tenantId || 'unknown',
  });
}

// Função para registrar métricas de API
export function recordApiMetrics(method: string, path: string, statusCode: number, duration: number, tenantId?: string) {
  apiRequestCounter.add(1, {
    method,
    path,
    status_code: statusCode.toString(),
    tenant_id: tenantId || 'unknown',
  });

  apiResponseTimeHistogram.record(duration, {
    method,
    path,
    status_code: statusCode.toString(),
    tenant_id: tenantId || 'unknown',
  });
}

// Função para registrar métricas de banco de dados
export function recordDbMetrics(queryType: string, duration: number, success: boolean, tenantId?: string) {
  dbQueryDurationHistogram.record(duration, {
    query_type: queryType,
    success: success.toString(),
    tenant_id: tenantId || 'unknown',
  });

  dbConnectionCounter.add(1, {
    query_type: queryType,
    success: success.toString(),
    tenant_id: tenantId || 'unknown',
  });
}
