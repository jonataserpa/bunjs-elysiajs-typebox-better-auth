# Payment API - Multi-tenant Payment Processing

Uma API de pagamentos moderna construída com **Clean Architecture**, **Domain-Driven Design (DDD)** e **Test-Driven Development (TDD)**, utilizando Bun, Elysia.js e TypeScript.

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com as seguintes camadas:

- **Domain Layer**: Entidades, Value Objects, Domain Services e Interfaces
- **Application Layer**: Use Cases, Application Services e DTOs  
- **Infrastructure Layer**: Implementações concretas (Drizzle ORM, External APIs, Repositories)
- **Presentation Layer**: Controllers HTTP, DTOs de Request/Response e Validação

## 🚀 Stack Tecnológica

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime moderno e performático
- **Framework**: [Elysia.js](https://elysiajs.com/) - Framework HTTP rápido e type-safe
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox) - Schemas e geração de OpenAPI
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM moderno e type-safe
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
- **Auth**: [Better Auth](https://better-auth.com/) - Autenticação local sem dependências externas
- **Payment Gateways**: Stripe e Pagar.me
- **Testing**: Bun Test - Suite de testes nativa do Bun
- **Containerization**: Docker + Kubernetes

## 📋 Funcionalidades

- ✅ **Multi-tenancy** - Isolamento completo por tenant
- ✅ **Autenticação JWT** - Sistema seguro sem dependências externas
- ✅ **Múltiplos Gateways** - Suporte a Stripe e Pagar.me
- ✅ **Documentação Automática** - OpenAPI/Swagger gerado automaticamente
- ✅ **Testes Abrangentes** - Unitários, integração e E2E
- ✅ **Escalabilidade** - Preparado para Kubernetes
- ✅ **Observabilidade** - Logs estruturados e métricas

## 🛠️ Pré-requisitos

- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 15
- [Redis](https://redis.io/) >= 7 (opcional para cache)

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd payment-bunjs
```

2. **Instale as dependências**
```bash
bun install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Crie o banco PostgreSQL
createdb payment_api

# Execute as migrações (quando implementadas)
bun run db:migrate
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
bun run dev
```

### Produção
```bash
bun run build
bun run start
```

### Testes
```bash
# Todos os testes
bun test

# Testes unitários
bun run test:unit

# Testes de integração
bun run test:integration

# Testes E2E
bun run test:e2e

# Com cobertura
bun run test:coverage
```

### Qualidade de Código
```bash
# Verificação de tipos
bun run type-check

# Linting
bun run lint

# Formatação
bun run format
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **OpenAPI JSON**: http://localhost:3000/docs/json

## 🏗️ Estrutura do Projeto

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/             # Entidades de negócio
│   ├── value-objects/        # Value Objects
│   ├── services/             # Domain Services
│   ├── events/               # Domain Events
│   └── exceptions/           # Domain Exceptions
├── application/              # Camada de Aplicação
│   ├── use-cases/           # Casos de uso
│   ├── services/            # Application Services
│   ├── interfaces/          # Interfaces para inversão de dependência
│   └── mappers/             # Mapeadores entre camadas
├── infrastructure/           # Camada de Infraestrutura
│   ├── database/            # Drizzle ORM e migrações
│   ├── external/            # APIs externas (Stripe, Pagar.me)
│   ├── auth/                # Better Auth
│   └── logging/             # Sistema de logs
├── presentation/             # Camada de Apresentação
│   ├── controllers/         # Controllers HTTP
│   ├── routes/              # Definição de rotas
│   ├── dto/                 # Data Transfer Objects
│   ├── middleware/          # Middlewares HTTP
│   └── schemas/             # Schemas TypeBox
└── shared/                   # Código compartilhado
    ├── types/               # Tipos compartilhados
    ├── constants/           # Constantes
    ├── utils/               # Utilitários
    └── config/              # Configurações
```

## 🧪 Estratégia de Testes

O projeto utiliza **Test-Driven Development (TDD)** com a seguinte estrutura:

- **Testes Unitários**: Testam componentes isolados
- **Testes de Integração**: Testam integração entre módulos
- **Testes E2E**: Testam fluxos completos end-to-end
- **Testes de Performance**: Benchmarks e testes de carga

### Cobertura de Testes

- **Meta**: > 90% de cobertura
- **Ferramenta**: Bun Test com relatórios de cobertura
- **Estratégia**: TDD - testes primeiro, implementação depois

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Inicia o servidor em modo desenvolvimento |
| `bun run build` | Compila a aplicação para produção |
| `bun run start` | Inicia a aplicação compilada |
| `bun test` | Executa todos os testes |
| `bun run test:unit` | Executa apenas testes unitários |
| `bun run test:integration` | Executa apenas testes de integração |
| `bun run test:e2e` | Executa apenas testes E2E |
| `bun run test:coverage` | Executa testes com relatório de cobertura |
| `bun run lint` | Executa ESLint |
| `bun run format` | Formata código com Prettier |
| `bun run type-check` | Verifica tipos TypeScript |

## 🚀 Deploy

### Docker
```bash
# Build da imagem
docker build -t payment-api .

# Executar container
docker run -p 3000:3000 payment-api
```

### Kubernetes
```bash
# Aplicar manifests
kubectl apply -f k8s/

# Verificar status
kubectl get pods -n payment-api
```

## 📊 Observabilidade

Este projeto implementa um stack completo de observabilidade com **OpenTelemetry**, **Prometheus**, **Grafana** e **Jaeger**.

### 🏗️ Stack de Observabilidade

- **OpenTelemetry**: Instrumentação automática e manual para traces e métricas
- **Prometheus**: Coleta e armazenamento de métricas
- **Grafana**: Visualização de métricas e dashboards
- **Jaeger**: Análise de traces distribuídos
- **OpenTelemetry Collector**: Agregação e processamento de telemetria

### 🚀 Como Usar a Observabilidade

#### Ordem de Execução (Passo a Passo)

**1. Iniciar o Stack Completo**
```bash
# Iniciar todos os serviços (aplicação + observabilidade)
docker-compose up -d

# Verificar se todos os serviços estão rodando
docker-compose ps
```

**2. Verificar Saúde dos Serviços**
```bash
# Verificar se a aplicação está respondendo
curl http://localhost:3000/health

# Verificar se as métricas estão sendo geradas
curl http://localhost:3000/metrics

# Verificar se o Prometheus está coletando
curl http://localhost:9090/api/v1/targets
```

**3. Acessar as Interfaces**

- **Grafana Dashboard**: http://localhost:3001
  - Usuário: `admin`
  - Senha: `admin123`
  - Dashboard: "Payment API Overview"

- **Jaeger UI**: http://localhost:16686
  - Visualizar traces das requisições
  - Analisar performance e latência

- **Prometheus**: http://localhost:9090
  - Consultar métricas diretamente
  - Configurar alertas

- **Payment API**: http://localhost:3000
  - Swagger: http://localhost:3000/docs
  - Health: http://localhost:3000/health
  - Métricas: http://localhost:3000/metrics

**4. Executar Teste de Carga**
```bash
# Executar teste de carga com Gatling
./run-load-test.sh

# Ou executar diretamente via Docker Compose
docker-compose --profile testing up gatling
```

**5. Verificar Dados nos Dashboards**
- Acesse o Grafana e verifique se as métricas estão sendo atualizadas
- Acesse o Jaeger e verifique se os traces estão aparecendo
- Execute requisições manuais para gerar mais dados:
```bash
# Gerar tráfego manual
for i in {1..10}; do
  curl http://localhost:3000/health
  curl http://localhost:3000/api/v1/auth/me
  sleep 1
done
```

### 📈 Métricas Disponíveis

#### Métricas Customizadas
- `payment_api_requests_total` - Total de requisições por endpoint
- `payment_api_response_time_seconds` - Tempo de resposta (histograma)
- `payment_api_payments_total` - Total de pagamentos por status/provedor
- `payment_api_http_errors_total` - Total de erros HTTP por status code
- `payment_api_up` - Status de uptime da aplicação

#### Métricas do Sistema
- `process_cpu_seconds_total` - Uso de CPU
- `process_resident_memory_bytes` - Uso de memória
- `http_requests_total` - Requisições HTTP (instrumentação automática)
- `http_request_duration_seconds` - Duração das requisições HTTP

### 🔍 Traces Implementados

#### Traces Automáticos (OpenTelemetry)
- Requisições HTTP (Elysia/Bun)
- Consultas PostgreSQL (Drizzle ORM)
- Chamadas para APIs externas

#### Traces Manuais (Críticos)
- `POST /api/v1/auth/login` - Fluxo de autenticação
- `GET /api/v1/payments` - Listagem de pagamentos
- `GET /api/v1/transactions` - Listagem de transações
- `GET /health` - Health checks

### 🧪 Teste de Carga com Gatling

#### Configuração
- **Simulação**: `PaymentApiSimulation.scala`
- **Usuários**: Dados reais do seed (`admin@techcorp.com`, etc.)
- **Cenários**: 
  - Health Check (30%)
  - Autenticação + Operações (40%)
  - Endpoints não autenticados (30%)

#### Executar Testes
```bash
# Teste completo com verificação de serviços
./run-load-test.sh

# Teste direto via Docker
docker-compose --profile testing up gatling

# Verificar resultados
ls -la load-test/results/
```

### 📊 Dashboards Grafana

#### Payment API Overview
- **Request Rate**: Requisições por segundo
- **Response Time**: Latência P50, P95, P99
- **Error Rate**: Taxa de erros por endpoint
- **Payment Metrics**: Status de pagamentos
- **System Metrics**: CPU, memória, uptime

### 🔧 Configuração Avançada

#### OpenTelemetry Collector
```yaml
# infra/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  jaeger:
    endpoint: jaeger:14250
```

#### Variáveis de Ambiente
```bash
# OpenTelemetry
OTEL_SERVICE_NAME=payment-api
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://otel-collector:4318/v1/metrics

# Aplicação
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/payment_api
```

### 🚨 Troubleshooting

#### Verificar Status dos Serviços
```bash
# Status dos containers
docker-compose ps

# Logs da aplicação
docker-compose logs payment-api

# Logs do OpenTelemetry Collector
docker-compose logs otel-collector

# Verificar métricas
curl http://localhost:3000/metrics
```

#### Problemas Comuns
1. **Grafana sem dados**: Verificar se Prometheus está coletando métricas
2. **Jaeger sem traces**: Verificar configuração do OpenTelemetry Collector
3. **Métricas estáticas**: Verificar se a aplicação está gerando tráfego

### ⚡ Comandos Rápidos

#### Comandos Essenciais
```bash
# Iniciar tudo
docker-compose up -d

# Parar tudo
docker-compose down

# Ver logs da aplicação
docker-compose logs -f payment-api

# Rebuildar apenas a aplicação
docker-compose up --build --force-recreate payment-api

# Executar teste de carga
./run-load-test.sh

# Verificar métricas
curl http://localhost:3000/metrics | head -20

# Testar login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123","tenantId":"f8e28508-e44e-4d5e-9b3c-23e327fe01af"}'
```

#### Scripts Úteis
```bash
# Verificar status de todos os serviços
docker-compose ps

# Limpar dados e reiniciar
docker-compose down -v && docker-compose up -d

# Ver logs de todos os serviços
docker-compose logs -f

# Executar seed do banco (se necessário)
docker-compose exec payment-api bun run src/infrastructure/database/seed.ts
```

### 📚 Arquivos de Configuração

- `infra/otel-collector-config.yaml` - Configuração do OpenTelemetry Collector
- `infra/grafana/dashboards/payment-api-overview.json` - Dashboard principal
- `infra/prometheus/prometheus.yml` - Configuração do Prometheus
- `load-test/user-files/simulations/PaymentApiSimulation.scala` - Simulação Gatling
- `load-test/user-files/data/users.csv` - Dados de usuários para teste
- `run-load-test.sh` - Script para executar testes de carga

## 🔒 Segurança

- **Autenticação**: JWT com Better Auth
- **Autorização**: RBAC por tenant
- **Validação**: TypeBox schemas
- **HTTPS**: Obrigatório em produção
- **Rate Limiting**: Por tenant e endpoint
- **Secrets**: Criptografia AES-256


## 📝 Roadmap

Consulte o arquivo [ROADMAP-IMPLEMENTACAO.md](docs/ROADMAP-IMPLEMENTACAO.md) para o cronograma detalhado de implementação.
