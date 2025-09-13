# PRD-001: Stack Tecnológica para API de Pagamentos

## 1. Visão Geral

### 1.1 Objetivo
Definir e implementar a stack tecnológica moderna e performática para a API de pagamentos, focando em Developer Experience (DX), performance e facilidade de manutenção.

### 1.2 Escopo
- Runtime e framework principal
- Arquitetura Clean Architecture com DDD
- ORM e banco de dados
- Sistema de autenticação
- Documentação automática
- Empacotamento e distribuição
- Observabilidade básica
- Estratégia de testes TDD

### 1.3 Critérios de Sucesso
- Performance superior a Node.js tradicional
- Developer Experience otimizada
- Deploy simplificado com binário único
- Documentação automática via OpenAPI
- Testes rápidos e confiáveis com TDD
- Arquitetura limpa e bem separada
- Domínio rico e expressivo

## 2. Requisitos Funcionais

### 2.1 Runtime e Framework
- **RF-001**: Utilizar Bun como runtime JavaScript moderno
- **RF-002**: Implementar API REST com Elysia.js
- **RF-003**: Gerar documentação automática via OpenAPI/Swagger
- **RF-004**: Validação de schemas com TypeBox
- **RF-005**: Tipagem automática do lado cliente via Treaty

### 2.2 Persistência de Dados
- **RF-006**: Integração com PostgreSQL via Drizzle ORM
- **RF-007**: Migrações automatizadas de banco de dados
- **RF-008**: Suporte a transações e queries otimizadas

### 2.3 Autenticação e Autorização
- **RF-009**: Sistema de autenticação local com Better Auth
- **RF-010**: Geração e validação de JWT
- **RF-011**: Suporte a multi-tenancy nativo
- **RF-012**: Controle granular de permissões

### 2.4 Empacotamento e Distribuição
- **RF-013**: Compilação em binário único executável
- **RF-014**: Imagem Docker otimizada e mínima
- **RF-015**: Suporte a múltiplas plataformas (Linux, macOS, Windows)

## 3. Requisitos Não Funcionais

### 3.1 Performance
- **RNF-001**: Tempo de resposta < 50ms para endpoints simples
- **RNF-002**: Throughput mínimo de 1000 req/s por instância
- **RNF-003**: Tempo de inicialização < 2 segundos
- **RNF-004**: Consumo de memória otimizado (< 100MB baseline)

### 3.2 Escalabilidade
- **RNF-005**: Suporte a escalabilidade horizontal
- **RNF-006**: Stateless application design
- **RNF-007**: Connection pooling otimizado

### 3.3 Manutenibilidade
- **RNF-008**: Código TypeScript com tipagem estrita
- **RNF-009**: Estrutura modular e bem organizada
- **RNF-010**: Testes automatizados com alta cobertura
- **RNF-011**: Logs estruturados e observabilidade

### 3.4 Segurança
- **RNF-012**: Validação rigorosa de inputs
- **RNF-013**: Proteção contra ataques comuns (CSRF, XSS, etc.)
- **RNF-014**: Gestão segura de credenciais e secrets

## 4. Arquitetura Proposta

### 4.1 Arquitetura Clean Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Elysia.js     │  │   TypeBox       │  │   Better Auth   │ │
│  │   Controllers   │  │   Validation    │  │   JWT Auth      │ │
│  │   Routes        │  │   OpenAPI       │  │   Multi-tenant  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Use Cases     │  │   Services      │  │   DTOs          │ │
│  │   Orchestration │  │   Application   │  │   Mappers       │ │
│  │   Validation    │  │   Logic         │  │   Interfaces    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Entities      │  │   Value Objects │  │   Domain        │ │
│  │   Payment       │  │   Money         │  │   Services      │ │
│  │   Transaction   │  │   Status        │  │   Business      │ │
│  │   Tenant        │  │   Currency      │  │   Rules         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Drizzle ORM   │  │   Stripe API    │  │   Pagar.me API  │ │
│  │   PostgreSQL    │  │   Gateway       │  │   Gateway       │ │
│  │   Migrations    │  │   Integration   │  │   Integration   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Estrutura de Diretórios Clean Architecture
```
src/
├── index.ts                 # Entry point da aplicação
├── app.ts                   # Configuração do Elysia

# PRESENTATION LAYER
├── presentation/
│   ├── controllers/         # Controllers HTTP
│   │   ├── auth.controller.ts
│   │   ├── payment.controller.ts
│   │   └── tenant.controller.ts
│   ├── routes/             # Definição de rotas
│   │   ├── auth.routes.ts
│   │   ├── payment.routes.ts
│   │   └── health.routes.ts
│   ├── dto/                # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── payment.dto.ts
│   │   └── common.dto.ts
│   ├── middleware/         # Middlewares HTTP
│   │   ├── auth.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   └── validation.middleware.ts
│   └── schemas/            # Schemas TypeBox para validação
│       ├── auth.schemas.ts
│       ├── payment.schemas.ts
│       └── common.schemas.ts

# APPLICATION LAYER
├── application/
│   ├── use-cases/          # Casos de uso
│   │   ├── auth/
│   │   │   ├── login.use-case.ts
│   │   │   └── register.use-case.ts
│   │   ├── payment/
│   │   │   ├── create-payment.use-case.ts
│   │   │   ├── capture-payment.use-case.ts
│   │   │   └── refund-payment.use-case.ts
│   │   └── tenant/
│   │       ├── create-tenant.use-case.ts
│   │       └── update-tenant.use-case.ts
│   ├── services/           # Serviços de aplicação
│   │   ├── auth.service.ts
│   │   ├── payment.service.ts
│   │   └── tenant.service.ts
│   ├── interfaces/         # Interfaces para inversão de dependência
│   │   ├── repositories/
│   │   │   ├── payment.repository.interface.ts
│   │   │   ├── tenant.repository.interface.ts
│   │   │   └── user.repository.interface.ts
│   │   └── gateways/
│   │       ├── payment.gateway.interface.ts
│   │       └── notification.gateway.interface.ts
│   └── mappers/            # Mapeadores entre camadas
│       ├── payment.mapper.ts
│       ├── tenant.mapper.ts
│       └── user.mapper.ts

# DOMAIN LAYER
├── domain/
│   ├── entities/           # Entidades de domínio
│   │   ├── payment.entity.ts
│   │   ├── transaction.entity.ts
│   │   ├── tenant.entity.ts
│   │   └── user.entity.ts
│   ├── value-objects/      # Value Objects
│   │   ├── money.value-object.ts
│   │   ├── payment-status.value-object.ts
│   │   ├── currency.value-object.ts
│   │   └── email.value-object.ts
│   ├── services/           # Serviços de domínio
│   │   ├── payment.domain.service.ts
│   │   ├── tenant.domain.service.ts
│   │   └── notification.domain.service.ts
│   ├── events/             # Domain Events
│   │   ├── payment-created.event.ts
│   │   ├── payment-captured.event.ts
│   │   └── tenant-created.event.ts
│   └── exceptions/         # Exceções de domínio
│       ├── payment.exception.ts
│       ├── tenant.exception.ts
│       └── validation.exception.ts

# INFRASTRUCTURE LAYER
├── infrastructure/
│   ├── database/           # Configuração Drizzle
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   ├── connection.ts
│   │   └── repositories/   # Implementações dos repositories
│   │       ├── payment.repository.ts
│   │       ├── tenant.repository.ts
│   │       └── user.repository.ts
│   ├── external/           # Integrações externas
│   │   ├── stripe/
│   │   │   ├── stripe.gateway.ts
│   │   │   └── stripe.config.ts
│   │   ├── pagarme/
│   │   │   ├── pagarme.gateway.ts
│   │   │   └── pagarme.config.ts
│   │   └── notifications/
│   │       ├── email.gateway.ts
│   │       └── webhook.gateway.ts
│   ├── auth/               # Implementação de autenticação
│   │   ├── better-auth.config.ts
│   │   └── jwt.service.ts
│   └── logging/            # Sistema de logs
│       ├── logger.ts
│       ├── audit.logger.ts
│       └── metrics.logger.ts

# SHARED
├── shared/
│   ├── types/              # Tipos compartilhados
│   ├── constants/          # Constantes
│   ├── utils/              # Utilitários
│   └── config/             # Configurações
│       ├── app.config.ts
│       ├── db.config.ts
│       └── auth.config.ts

# TESTS
├── tests/
│   ├── unit/               # Testes unitários
│   │   ├── domain/
│   │   ├── application/
│   │   └── presentation/
│   ├── integration/        # Testes de integração
│   │   ├── database/
│   │   ├── external-apis/
│   │   └── use-cases/
│   ├── e2e/                # Testes end-to-end
│   │   ├── payment-flow/
│   │   ├── auth-flow/
│   │   └── tenant-management/
│   └── fixtures/           # Dados de teste
        ├── payment.fixtures.ts
        ├── tenant.fixtures.ts
        └── user.fixtures.ts
```

## 5. Especificações Técnicas

### 5.1 Dependências Principais
```json
{
  "dependencies": {
    "elysia": "^0.8.0",
    "@sinclair/typebox": "^0.32.0",
    "drizzle-orm": "^0.29.0",
    "better-auth": "^0.7.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "@types/node": "^20.0.0"
  }
}
```

### 5.2 Configuração do Elysia
```typescript
// src/app.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

export const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Payment API',
        version: '1.0.0',
        description: 'API de pagamentos multi-tenant'
      }
    }
  }))
  .get('/health', () => ({ status: 'ok' }))
  .listen(3000)
```

### 5.3 Dockerfile Otimizado
```dockerfile
# Build stage
FROM oven/bun:alpine as build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build src/index.ts --compile --outfile payment-api

# Runtime stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /app/payment-api .
EXPOSE 3000
CMD ["./payment-api"]
```

## 6. Critérios de Aceitação

### 6.1 Funcionalidade
- [ ] API responde corretamente em todas as rotas definidas
- [ ] Documentação OpenAPI é gerada automaticamente
- [ ] Autenticação JWT funciona corretamente
- [ ] Conexão com PostgreSQL estabelecida
- [ ] Validação de schemas funciona em todos os endpoints

### 6.2 Performance
- [ ] Tempo de resposta < 50ms para endpoints simples
- [ ] Aplicação inicia em < 2 segundos
- [ ] Consumo de memória < 100MB em idle
- [ ] Binário compilado funciona independentemente

### 6.3 Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Linting sem erros
- [ ] TypeScript sem erros de tipo
- [ ] Documentação atualizada

## 7. Riscos e Mitigações

### 7.1 Riscos Técnicos
- **Risco**: Comunidade menor do Bun comparado ao Node.js
  - **Mitigação**: Testes extensivos e validação em ambiente de staging
- **Risco**: Compatibilidade com bibliotecas legacy
  - **Mitigação**: Validação prévia de todas as dependências críticas

### 7.2 Riscos de Negócio
- **Risco**: Curva de aprendizado da equipe
  - **Mitigação**: Treinamento e documentação detalhada
- **Risco**: Dependência de tecnologia emergente
  - **Mitigação**: Monitoramento ativo de updates e fallback para Node.js se necessário

## 8. Cronograma

### Fase 1: Setup Inicial (1 semana)
- Configuração do ambiente de desenvolvimento
- Setup do Bun e Elysia.js
- Configuração básica do Drizzle ORM
- Estrutura inicial de diretórios

### Fase 2: Core Features (2 semanas)
- Implementação do Better Auth
- Configuração do TypeBox e OpenAPI
- Middlewares de autenticação e tenant
- Testes unitários básicos

### Fase 3: Integração e Testes (1 semana)
- Testes de integração com PostgreSQL
- Testes E2E básicos
- Otimização de performance
- Documentação técnica

### Fase 4: Deploy e Validação (1 semana)
- Configuração do Docker
- Testes de deploy
- Validação de performance
- Documentação de deploy

## 9. Métricas de Sucesso

### 9.1 Métricas Técnicas
- Tempo de build: < 30 segundos
- Tempo de inicialização: < 2 segundos
- Cobertura de testes: > 80%
- Performance: > 1000 req/s

### 9.2 Métricas de Qualidade
- Zero bugs críticos em produção
- Tempo de resolução de bugs: < 4 horas
- Satisfação da equipe: > 8/10
- Uptime: > 99.9%

## 10. Próximos Passos

1. **Configuração do ambiente de desenvolvimento**
2. **Implementação da estrutura base**
3. **Setup do sistema de autenticação**
4. **Configuração do banco de dados**
5. **Implementação dos testes automatizados**
6. **Configuração do CI/CD**
7. **Deploy em ambiente de staging**
8. **Validação de performance e funcionalidade**
