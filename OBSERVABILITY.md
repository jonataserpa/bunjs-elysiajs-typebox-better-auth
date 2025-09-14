# 📊 Observabilidade - Payment API

Este documento contém todos os comandos essenciais para testar e monitorar a observabilidade da Payment API.

## 🏗️ Stack de Observabilidade

- **OpenTelemetry**: Instrumentação e coleta de dados
- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização de dados
- **Jaeger**: Distributed tracing
- **OpenTelemetry Collector**: Agregação e exportação de dados

## 🚀 Inicialização dos Serviços

```bash
# Iniciar toda a stack de observabilidade
docker-compose up -d

# Iniciar apenas a aplicação (se outros serviços já estiverem rodando)
docker-compose up --build payment-api -d

# Verificar status dos serviços
docker-compose ps
```

## 🔍 Testes de Conectividade

### 1. Health Checks dos Serviços

```bash
# Grafana
curl http://localhost:3001/api/health

# Prometheus
curl http://localhost:9090/-/healthy

# Jaeger
curl http://localhost:16686/api/services

# Payment API
curl http://localhost:3000/health
```

### 2. Verificar se os Serviços Estão Coletando Dados

```bash
# Verificar targets do Prometheus
curl -s 'http://localhost:9090/api/v1/targets'

# Verificar se payment-api está sendo coletado
curl -s 'http://localhost:9090/api/v1/targets' | grep -A 10 -B 5 "payment-api"
```

## 📈 Testes de Métricas (Prometheus)

### 1. Endpoint de Métricas da Aplicação

```bash
# Ver métricas brutas da aplicação
curl http://localhost:3000/metrics

# Ver métricas formatadas
curl -s http://localhost:3000/metrics | grep -E "(HELP|TYPE|payment_api_)"
```

### 2. Queries Prometheus

```bash
# Verificar se o target está UP
curl -s 'http://localhost:9090/api/v1/query?query=up{job="payment-api"}'

# Contador de requisições
curl -s 'http://localhost:9090/api/v1/query?query=payment_api_requests_total'

# Taxa de requisições por segundo (últimos 5 minutos)
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(payment_api_requests_total[5m])) by (method, path)'

# Métricas de pagamentos
curl -s 'http://localhost:9090/api/v1/query?query=payment_api_payments_total'

# Métricas de erros HTTP
curl -s 'http://localhost:9090/api/v1/query?query=payment_api_http_errors_total'

# Tempo de resposta (percentil 95)
curl -s 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, sum(rate(payment_api_response_time_seconds_bucket[5m])) by (le, method, path))'
```

### 3. Gerar Tráfego para Testes

```bash
# Gerar tráfego básico
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/auth/me
curl http://localhost:3000/api/v1/payments?page=1&limit=5

# Gerar múltiplas requisições
for i in {1..10}; do
  curl -s http://localhost:3000/health > /dev/null
  curl -s http://localhost:3000/api/v1/auth/me > /dev/null
done
echo "Tráfego gerado"
```

## 🔍 Testes de Traces (Jaeger)

### 1. Verificar Traces Disponíveis

```bash
# Listar todos os traces do serviço payment-api
curl -s 'http://localhost:16686/api/traces?service=payment-api&limit=10'

# Filtrar por operação específica
curl -s 'http://localhost:16686/api/traces?service=payment-api&operation=GET%20/health&limit=5'

# Verificar traces de autenticação
curl -s 'http://localhost:16686/api/traces?service=payment-api&operation=GET%20/api/v1/auth/me&limit=5'

# Verificar traces de pagamentos
curl -s 'http://localhost:16686/api/traces?service=payment-api&operation=GET%20/api/v1/payments&limit=5'
```

### 2. Gerar Traces para Testes

```bash
# Testar endpoint de trace manual
curl http://localhost:3000/test-trace

# Testar rotas com traces automáticos
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/auth/me
curl http://localhost:3000/api/v1/payments?page=1&limit=5
```

## 📊 Testes do Grafana

### 1. Acesso e Configuração

```bash
# URL do Grafana
echo "Grafana: http://localhost:3001"
echo "Login: admin / admin123"
echo "Dashboard: Payment API - Overview"
```

### 2. Verificar Datasources

```bash
# Verificar se Prometheus está configurado
curl -s http://localhost:3001/api/datasources -u admin:admin123

# Testar query do datasource Prometheus
curl -s 'http://localhost:3001/api/datasources/proxy/prometheus/api/v1/query?query=up' -u admin:admin123
```

### 3. Queries de Dashboard

```bash
# Testar queries do dashboard no Prometheus diretamente
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(payment_api_requests_total[5m])) by (method, path)'

curl -s 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, sum(rate(payment_api_response_time_seconds_bucket[5m])) by (le, method, path))'

curl -s 'http://localhost:9090/api/v1/query?query=sum(payment_api_payments_total) by (status)'

curl -s 'http://localhost:9090/api/v1/query?query=sum(payment_api_payments_total) by (provider)'

curl -s 'http://localhost:9090/api/v1/query?query=sum(payment_api_http_errors_total) by (status_code, method, path)'
```

## 🐳 Comandos Docker Essenciais

### 1. Logs dos Serviços

```bash
# Logs da aplicação
docker logs payment-bunjs-payment-api-1 --tail 20

# Logs do Prometheus
docker logs payment-bunjs-prometheus-1 --tail 20

# Logs do Grafana
docker logs payment-bunjs-grafana-1 --tail 20

# Logs do Jaeger
docker logs payment-bunjs-jaeger-1 --tail 20

# Logs do OpenTelemetry Collector
docker logs payment-bunjs-otel-collector-1 --tail 20
```

### 2. Reinicialização de Serviços

```bash
# Reiniciar apenas a aplicação
docker-compose restart payment-api

# Reiniciar Grafana (para recarregar dashboards)
docker-compose restart grafana

# Rebuild completo
docker-compose up --build -d
```

### 3. Verificação de Status

```bash
# Status de todos os containers
docker-compose ps

# Uso de recursos
docker stats --no-stream

# Verificar portas em uso
docker-compose port payment-api 3000
docker-compose port grafana 3001
docker-compose port prometheus 9090
docker-compose port jaeger 16686
```

## 🔧 Troubleshooting

### 1. Problemas Comuns

```bash
# Verificar se as portas estão livres
netstat -tlnp | grep -E "(3000|3001|9090|16686)"

# Verificar conectividade entre containers
docker exec payment-bunjs-payment-api-1 curl -s http://prometheus:9090/-/healthy
docker exec payment-bunjs-payment-api-1 curl -s http://otel-collector:4318/v1/traces

# Verificar variáveis de ambiente
docker exec payment-bunjs-payment-api-1 env | grep OTEL
```

### 2. Reset Completo

```bash
# Parar todos os serviços
docker-compose down

# Remover volumes (cuidado: apaga dados)
docker-compose down -v

# Rebuild completo
docker-compose up --build -d
```

## 📋 Checklist de Verificação

### ✅ Serviços Funcionando

- [ ] Payment API: `curl http://localhost:3000/health`
- [ ] Grafana: `curl http://localhost:3001/api/health`
- [ ] Prometheus: `curl http://localhost:9090/-/healthy`
- [ ] Jaeger: `curl http://localhost:16686/api/services`

### ✅ Coleta de Dados

- [ ] Prometheus coletando: `curl -s 'http://localhost:9090/api/v1/targets' | grep payment-api`
- [ ] Métricas disponíveis: `curl http://localhost:3000/metrics`
- [ ] Traces no Jaeger: `curl -s 'http://localhost:16686/api/traces?service=payment-api'`

### ✅ Dashboards

- [ ] Grafana acessível: http://localhost:3001
- [ ] Datasource Prometheus configurado
- [ ] Dashboard "Payment API - Overview" carregado
- [ ] Gráficos mostrando dados

## 🎯 URLs de Acesso

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Payment API** | http://localhost:3000 | - |
| **API Docs** | http://localhost:3000/docs | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Jaeger** | http://localhost:16686 | - |

## 📚 Comandos Úteis para Desenvolvimento

```bash
# Monitorar logs em tempo real
docker-compose logs -f payment-api

# Executar comandos dentro do container
docker exec -it payment-bunjs-payment-api-1 /bin/sh

# Verificar métricas em tempo real
watch -n 2 'curl -s http://localhost:3000/metrics | grep payment_api_requests_total'

# Testar performance
ab -n 100 -c 10 http://localhost:3000/health
```

---

**📝 Nota**: Esta documentação deve ser atualizada sempre que novos endpoints de métricas ou dashboards forem adicionados.
