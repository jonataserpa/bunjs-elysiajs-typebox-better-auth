# 🔍 Observabilidade - Payment API

Este documento descreve a implementação completa de observabilidade para a Payment API usando OpenTelemetry, Grafana, Prometheus, Jaeger e Gatling.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Executando](#executando)
- [Dashboards](#dashboards)
- [Métricas](#métricas)
- [Tracing](#tracing)
- [Testes de Carga](#testes-de-carga)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

A observabilidade foi implementada seguindo as melhores práticas de monitoramento de aplicações modernas:

- **OpenTelemetry**: Instrumentação automática e customizada
- **Prometheus**: Coleta e armazenamento de métricas
- **Grafana**: Visualização e dashboards
- **Jaeger**: Distributed tracing
- **Gatling**: Testes de carga e performance

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Payment API   │───▶│ OpenTelemetry    │───▶│     Jaeger      │
│    (Bun.js)     │    │   Collector      │    │   (Tracing)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │    Prometheus    │
                       │   (Métricas)     │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │     Grafana      │
                       │  (Dashboards)    │
                       └──────────────────┘
```

## ⚙️ Configuração

### 1. Dependências Instaladas

```json
{
  "@opentelemetry/api": "^1.9.0",
  "@opentelemetry/sdk-node": "^0.205.0",
  "@opentelemetry/auto-instrumentations-node": "^0.64.1",
  "@opentelemetry/exporter-trace-otlp-grpc": "^0.205.0",
  "@opentelemetry/exporter-metrics-otlp-grpc": "^0.205.0",
  "@opentelemetry/resources": "^2.1.0",
  "@opentelemetry/sdk-metrics": "^2.1.0",
  "@opentelemetry/semantic-conventions": "^1.37.0",
  "@opentelemetry/instrumentation-http": "^0.205.0",
  "@opentelemetry/instrumentation-fs": "^0.25.0"
}
```

### 2. Variáveis de Ambiente

```bash
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=payment-api
OTEL_SERVICE_VERSION=1.0.0
OTEL_RESOURCE_ATTRIBUTES=service.name=payment-api,service.version=1.0.0,deployment.environment=development
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector:4317/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://otel-collector:4317/v1/metrics
OTEL_PROPAGATORS=tracecontext,baggage,b3
```

## 🚀 Executando

### 1. Subir toda a infraestrutura

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status dos serviços
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f payment-api
```

### 2. Verificar saúde dos serviços

```bash
# Health check da API
curl http://localhost:3000/health

# Health check do OpenTelemetry Collector
curl http://localhost:13133/

# Health check do Prometheus
curl http://localhost:9090/-/healthy

# Health check do Grafana
curl http://localhost:3001/api/health
```

### 3. Acessar interfaces

- **Payment API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## 📊 Dashboards

### Dashboard Principal - Payment API Overview

Localização: `infra/grafana/dashboards/payment-api-overview.json`

**Métricas incluídas:**
- Requests por segundo por endpoint
- Tempo de resposta (95th e 50th percentile)
- Distribuição de status de pagamentos
- Distribuição por provedor de pagamento
- Pagamentos por tenant
- Erros HTTP

### Como importar dashboards adicionais

1. Acesse o Grafana (http://localhost:3001)
2. Vá em **Dashboards** → **Import**
3. Cole o JSON do dashboard
4. Configure o datasource (Prometheus)

## 📈 Métricas

### Métricas Customizadas Implementadas

#### Pagamentos
- `payment_api_payments_total`: Total de pagamentos processados
- `payment_api_payment_amount`: Valores dos pagamentos em centavos
- `payment_api_payment_duration_ms`: Duração do processamento

#### Transações
- `payment_api_transactions_total`: Total de transações
- `payment_api_transaction_amount`: Valores das transações

#### API
- `payment_api_api_requests_total`: Total de requests da API
- `payment_api_api_response_time_ms`: Tempo de resposta da API
- `payment_api_http_errors_total`: Total de erros HTTP

#### Autenticação
- `payment_api_auth_attempts_total`: Tentativas de autenticação
- `payment_api_auth_success_total`: Autenticações bem-sucedidas
- `payment_api_auth_failure_total`: Falhas de autenticação

#### Banco de Dados
- `payment_api_db_query_duration_ms`: Duração das queries
- `payment_api_db_connections_total`: Conexões com o banco

### Labels Utilizados

Todas as métricas incluem labels para multi-tenancy:
- `tenant_id`: ID do tenant
- `status`: Status da operação
- `provider`: Provedor de pagamento
- `method`: Método HTTP
- `path`: Caminho da API
- `status_code`: Código de status HTTP

## 🔍 Tracing

### Spans Automáticos

O OpenTelemetry instrumenta automaticamente:
- Requests HTTP
- Queries de banco de dados
- Operações de sistema de arquivos

### Spans Customizados

Para adicionar spans customizados:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('payment-api');

// Criar span customizado
const span = tracer.startSpan('process-payment');
try {
  // Sua lógica aqui
  span.setAttributes({
    'payment.amount': amount,
    'payment.provider': provider,
    'tenant.id': tenantId
  });
} finally {
  span.end();
}
```

### Visualizando Traces

1. Acesse Jaeger: http://localhost:16686
2. Selecione o serviço `payment-api`
3. Clique em "Find Traces"
4. Explore os spans e suas dependências

## 🧪 Testes de Carga

### Executando com Gatling

```bash
# Executar testes de carga
docker-compose --profile testing up gatling

# Ver resultados
docker-compose logs gatling

# Acessar relatórios HTML (se montado localmente)
open gatling-results/index.html
```

### Cenários de Teste

1. **Payment API Load Test**: Teste normal de carga
   - 10 usuários iniciais
   - 20 usuários constantes por 2 minutos
   - Testa todos os endpoints principais

2. **Authentication Load Test**: Teste de autenticação
   - 5 usuários iniciais
   - 10 usuários constantes por 1 minuto

3. **Stress Test**: Teste de stress
   - 50 usuários iniciais
   - 100 usuários constantes por 3 minutos

### Métricas de Performance

Os testes validam:
- Tempo máximo de resposta < 5s
- Tempo médio de resposta < 1s
- Taxa de sucesso > 95%

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. OpenTelemetry não está enviando dados

```bash
# Verificar logs do collector
docker-compose logs otel-collector

# Verificar conectividade
curl http://localhost:13133/
```

#### 2. Prometheus não está coletando métricas

```bash
# Verificar targets
curl http://localhost:9090/api/v1/targets

# Verificar configuração
docker-compose logs prometheus
```

#### 3. Grafana não carrega dashboards

```bash
# Verificar datasources
curl -u admin:admin123 http://localhost:3001/api/datasources

# Verificar provisioning
docker-compose logs grafana
```

### Logs Úteis

```bash
# Todos os logs
docker-compose logs

# Logs específicos
docker-compose logs payment-api
docker-compose logs otel-collector
docker-compose logs prometheus
docker-compose logs grafana
```

### Reset da Infraestrutura

```bash
# Parar todos os serviços
docker-compose down

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Rebuild da API
docker-compose build payment-api

# Subir novamente
docker-compose up -d
```

## 📚 Recursos Adicionais

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Gatling Documentation](https://gatling.io/docs/)

## 🎯 Próximos Passos

1. **Alertas**: Configurar alertas no Prometheus
2. **Logs**: Integrar Loki para centralização de logs
3. **APM**: Implementar Application Performance Monitoring
4. **SLA**: Definir SLAs e SLOs
5. **Auto-scaling**: Implementar auto-scaling baseado em métricas
