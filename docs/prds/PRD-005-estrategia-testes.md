# PRD-005: Estratégia de Testes com TDD

## 1. Visão Geral

### 1.1 Objetivo
Implementar uma estratégia abrangente de testes seguindo Test-Driven Development (TDD), utilizando Bun test para garantir qualidade, confiabilidade e manutenibilidade do código em todas as camadas da Clean Architecture.

### 1.2 Escopo
- Testes unitários para todas as camadas
- Testes de integração com banco de dados
- Testes end-to-end (E2E)
- Testes de performance
- Cobertura de código abrangente
- Integração com CI/CD

### 1.3 Critérios de Sucesso
- Cobertura de testes > 90%
- Tempo de execução de todos os testes < 2 minutos
- Zero bugs críticos em produção
- Feedback rápido para desenvolvedores
- Testes confiáveis e determinísticos

## 2. Requisitos Funcionais

### 2.1 Testes Unitários
- **RF-001**: Testes para todas as entidades de domínio
- **RF-002**: Testes para value objects e domain services
- **RF-003**: Testes para use cases da camada de aplicação
- **RF-004**: Testes para mappers e validadores
- **RF-005**: Testes para utilitários e helpers
- **RF-006**: Mocks e stubs para dependências externas

### 2.2 Testes de Integração
- **RF-007**: Testes de integração com banco de dados
- **RF-008**: Testes de integração com APIs externas
- **RF-009**: Testes de integração com Better Auth
- **RF-010**: Testes de integração com gateways de pagamento
- **RF-011**: Testes de middleware e interceptors

### 2.3 Testes E2E
- **RF-012**: Testes de fluxos completos de pagamento
- **RF-013**: Testes de autenticação e autorização
- **RF-014**: Testes de gestão de tenants
- **RF-015**: Testes de webhooks e notificações
- **RF-016**: Testes de APIs públicas

### 2.4 Testes de Performance
- **RF-017**: Testes de carga para endpoints críticos
- **RF-018**: Testes de stress para banco de dados
- **RF-019**: Testes de concorrência
- **RF-020**: Testes de memória e vazamentos

## 3. Requisitos Não Funcionais

### 3.1 Performance
- **RNF-001**: Execução de todos os testes < 2 minutos
- **RNF-002**: Testes unitários < 100ms cada
- **RNF-003**: Testes de integração < 5 segundos cada
- **RNF-004**: Testes E2E < 30 segundos cada
- **RNF-005**: Paralelização de testes quando possível

### 3.2 Confiabilidade
- **RNF-006**: Testes determinísticos e repetíveis
- **RNF-007**: Isolamento entre testes
- **RNF-008**: Limpeza automática de dados de teste
- **RNF-009**: Rollback automático de transações
- **RNF-010**: Mocks consistentes e confiáveis

### 3.3 Manutenibilidade
- **RNF-011**: Código de teste limpo e legível
- **RNF-012**: Fixtures reutilizáveis
- **RNF-013**: Helpers e utilitários de teste
- **RNF-014**: Documentação de testes
- **RNF-015**: Padrões consistentes de nomenclatura

## 4. Arquitetura de Testes

### 4.1 Estrutura de Diretórios
```
tests/
├── unit/                    # Testes unitários
│   ├── domain/             # Testes da camada de domínio
│   │   ├── entities/
│   │   │   ├── user.entity.test.ts
│   │   │   ├── payment.entity.test.ts
│   │   │   └── tenant.entity.test.ts
│   │   ├── value-objects/
│   │   │   ├── email.value-object.test.ts
│   │   │   ├── money.value-object.test.ts
│   │   │   └── payment-status.value-object.test.ts
│   │   ├── services/
│   │   │   ├── payment.domain.service.test.ts
│   │   │   └── tenant.domain.service.test.ts
│   │   └── events/
│   │       ├── payment-created.event.test.ts
│   │       └── tenant-created.event.test.ts
│   ├── application/        # Testes da camada de aplicação
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── login.use-case.test.ts
│   │   │   │   └── register.use-case.test.ts
│   │   │   ├── payment/
│   │   │   │   ├── create-payment.use-case.test.ts
│   │   │   │   ├── capture-payment.use-case.test.ts
│   │   │   │   └── refund-payment.use-case.test.ts
│   │   │   └── tenant/
│   │   │       ├── create-tenant.use-case.test.ts
│   │   │       └── update-tenant.use-case.test.ts
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── payment.service.test.ts
│   │   │   └── tenant.service.test.ts
│   │   └── mappers/
│   │       ├── payment.mapper.test.ts
│   │       ├── tenant.mapper.test.ts
│   │       └── user.mapper.test.ts
│   ├── infrastructure/     # Testes da camada de infraestrutura
│   │   ├── repositories/
│   │   │   ├── payment.repository.test.ts
│   │   │   ├── tenant.repository.test.ts
│   │   │   └── user.repository.test.ts
│   │   ├── external/
│   │   │   ├── stripe/
│   │   │   │   └── stripe.gateway.test.ts
│   │   │   ├── pagarme/
│   │   │   │   └── pagarme.gateway.test.ts
│   │   │   └── notifications/
│   │   │       ├── email.gateway.test.ts
│   │   │       └── webhook.gateway.test.ts
│   │   └── auth/
│   │       ├── better-auth.service.test.ts
│   │       └── jwt.service.test.ts
│   └── shared/             # Testes de utilitários compartilhados
│       ├── utils/
│       ├── validators/
│       └── helpers/

├── integration/            # Testes de integração
│   ├── database/
│   │   ├── connection.test.ts
│   │   ├── migrations.test.ts
│   │   └── repositories.test.ts
│   ├── external-apis/
│   │   ├── stripe.integration.test.ts
│   │   ├── pagarme.integration.test.ts
│   │   └── webhook.integration.test.ts
│   ├── use-cases/
│   │   ├── payment-flow.integration.test.ts
│   │   ├── auth-flow.integration.test.ts
│   │   └── tenant-management.integration.test.ts
│   └── middleware/
│       ├── auth.middleware.integration.test.ts
│       ├── tenant.middleware.integration.test.ts
│       └── validation.middleware.integration.test.ts

├── e2e/                   # Testes end-to-end
│   ├── payment-flow/
│   │   ├── create-payment.e2e.test.ts
│   │   ├── capture-payment.e2e.test.ts
│   │   ├── refund-payment.e2e.test.ts
│   │   └── payment-status.e2e.test.ts
│   ├── auth-flow/
│   │   ├── login.e2e.test.ts
│   │   ├── register.e2e.test.ts
│   │   ├── logout.e2e.test.ts
│   │   └── refresh-token.e2e.test.ts
│   ├── tenant-management/
│   │   ├── create-tenant.e2e.test.ts
│   │   ├── update-tenant.e2e.test.ts
│   │   ├── tenant-config.e2e.test.ts
│   │   └── tenant-limits.e2e.test.ts
│   └── webhook-callbacks/
│       ├── stripe-webhook.e2e.test.ts
│       ├── pagarme-webhook.e2e.test.ts
│       └── webhook-processing.e2e.test.ts

├── performance/           # Testes de performance
│   ├── load/
│   │   ├── payment-endpoints.load.test.ts
│   │   ├── auth-endpoints.load.test.ts
│   │   └── tenant-endpoints.load.test.ts
│   ├── stress/
│   │   ├── database.stress.test.ts
│   │   ├── concurrent-users.stress.test.ts
│   │   └── memory-usage.stress.test.ts
│   └── benchmarks/
│       ├── auth-performance.benchmark.ts
│       ├── payment-performance.benchmark.ts
│       └── database-performance.benchmark.ts

├── fixtures/              # Dados de teste
│   ├── users.fixtures.ts
│   ├── payments.fixtures.ts
│   ├── tenants.fixtures.ts
│   └── common.fixtures.ts

├── helpers/               # Utilitários de teste
│   ├── test-database.helper.ts
│   ├── mock-factory.helper.ts
│   ├── api-client.helper.ts
│   └── assertion.helper.ts

├── setup/                 # Configuração de testes
│   ├── global-setup.ts
│   ├── test-setup.ts
│   ├── database-setup.ts
│   └── teardown.ts

└── config/                # Configurações de teste
    ├── jest.config.ts
    ├── test-database.config.ts
    └── test-environment.config.ts
```

### 4.2 Estratégia TDD
```typescript
// Exemplo de TDD - Red, Green, Refactor

// 1. RED - Escrever teste que falha
describe('Payment Entity', () => {
  it('should create a payment with valid amount', () => {
    const payment = Payment.create({
      amount: 10000, // R$ 100,00 em centavos
      currency: 'BRL',
      tenantId: 'tenant-123'
    })

    expect(payment.amount.value).toBe(10000)
    expect(payment.currency.value).toBe('BRL')
    expect(payment.status.value).toBe('pending')
  })

  it('should throw error for invalid amount', () => {
    expect(() => {
      Payment.create({
        amount: -1000, // Valor negativo
        currency: 'BRL',
        tenantId: 'tenant-123'
      })
    }).toThrow(InvalidAmountError)
  })
})

// 2. GREEN - Implementar código mínimo para passar
export class Payment {
  private constructor(
    private readonly _amount: Money,
    private readonly _currency: Currency,
    private readonly _tenantId: TenantId,
    private readonly _status: PaymentStatus
  ) {}

  static create(data: CreatePaymentData): Payment {
    const amount = new Money(data.amount)
    const currency = new Currency(data.currency)
    const tenantId = new TenantId(data.tenantId)
    const status = PaymentStatus.pending()

    return new Payment(amount, currency, tenantId, status)
  }

  get amount(): Money {
    return this._amount
  }

  get currency(): Currency {
    return this._currency
  }

  get status(): PaymentStatus {
    return this._status
  }
}

// 3. REFACTOR - Melhorar código mantendo testes passando
export class Money {
  constructor(private readonly _value: number) {
    if (this._value <= 0) {
      throw new InvalidAmountError('Amount must be positive')
    }
  }

  get value(): number {
    return this._value
  }
}
```

## 5. Configuração de Testes

### 5.1 Bun Test Configuration
```typescript
// bunfig.toml
[test]
# Configurações globais para testes
timeout = 30000
preload = ["./tests/setup/test-setup.ts"]
```

// tests/setup/test-setup.ts
```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test'
import { setupTestDatabase } from '../helpers/test-database.helper'
import { cleanupTestData } from '../helpers/cleanup.helper'

beforeAll(async () => {
  // Configurar banco de dados de teste
  await setupTestDatabase()
})

afterAll(async () => {
  // Limpar recursos de teste
  await cleanupTestData()
})

beforeEach(async () => {
  // Limpar dados entre testes
  await cleanupTestData()
})

afterEach(async () => {
  // Limpar mocks
  jest.clearAllMocks()
})
```

### 5.2 Test Database Helper
```typescript
// tests/helpers/test-database.helper.ts
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import Database from 'bun:sqlite'

export class TestDatabaseHelper {
  private static instance: TestDatabaseHelper
  private db: Database
  private drizzle: any

  private constructor() {
    this.db = new Database(':memory:')
    this.drizzle = drizzle(this.db)
  }

  static getInstance(): TestDatabaseHelper {
    if (!TestDatabaseHelper.instance) {
      TestDatabaseHelper.instance = new TestDatabaseHelper()
    }
    return TestDatabaseHelper.instance
  }

  async setup(): Promise<void> {
    // Executar migrações
    await migrate(this.drizzle, { migrationsFolder: './src/infrastructure/database/migrations' })
  }

  async cleanup(): Promise<void> {
    // Limpar todas as tabelas
    const tables = ['payments', 'tenants', 'users', 'transactions']
    for (const table of tables) {
      await this.db.exec(`DELETE FROM ${table}`)
    }
  }

  async seed(fixtures: any): Promise<void> {
    // Inserir dados de teste
    for (const [table, data] of Object.entries(fixtures)) {
      if (Array.isArray(data)) {
        for (const item of data) {
          await this.drizzle.insert(this.getTable(table)).values(item)
        }
      }
    }
  }

  getDrizzle() {
    return this.drizzle
  }

  private getTable(tableName: string) {
    // Retornar referência da tabela
    return this.drizzle[tableName]
  }
}
```

### 5.3 Mock Factory
```typescript
// tests/helpers/mock-factory.helper.ts
export class MockFactory {
  static createUser(overrides: Partial<UserData> = {}): UserData {
    return {
      id: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'customer',
      permissions: ['payments:read', 'payments:create'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  static createPayment(overrides: Partial<PaymentData> = {}): PaymentData {
    return {
      id: 'payment-123',
      amount: 10000,
      currency: 'BRL',
      tenantId: 'tenant-123',
      status: 'pending',
      paymentMethod: 'card',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  static createTenant(overrides: Partial<TenantData> = {}): TenantData {
    return {
      id: 'tenant-123',
      name: 'Test Tenant',
      domain: 'test.example.com',
      isActive: true,
      config: {
        paymentProvider: 'stripe',
        features: {
          allowRefunds: true,
          allowPartialRefunds: true,
          requireApproval: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }
}
```

## 6. Exemplos de Testes

### 6.1 Teste Unitário - Domain Entity
```typescript
// tests/unit/domain/entities/payment.entity.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'
import { Payment } from '../../../../src/domain/entities/payment.entity'
import { Money } from '../../../../src/domain/value-objects/money.value-object'
import { Currency } from '../../../../src/domain/value-objects/currency.value-object'
import { TenantId } from '../../../../src/domain/value-objects/tenant-id.value-object'

describe('Payment Entity', () => {
  let payment: Payment

  beforeEach(() => {
    payment = Payment.create({
      amount: 10000,
      currency: 'BRL',
      tenantId: 'tenant-123'
    })
  })

  it('should create a payment with valid data', () => {
    expect(payment.amount.value).toBe(10000)
    expect(payment.currency.value).toBe('BRL')
    expect(payment.tenantId.value).toBe('tenant-123')
    expect(payment.status.value).toBe('pending')
  })

  it('should capture a payment successfully', () => {
    payment.capture()

    expect(payment.status.value).toBe('captured')
    expect(payment.capturedAt).toBeDefined()
  })

  it('should not capture an already captured payment', () => {
    payment.capture()

    expect(() => {
      payment.capture()
    }).toThrow('Payment is already captured')
  })

  it('should refund a captured payment', () => {
    payment.capture()
    payment.refund(5000)

    expect(payment.status.value).toBe('refunded')
    expect(payment.refundedAmount.value).toBe(5000)
  })
})
```

### 6.2 Teste de Integração - Use Case
```typescript
// tests/integration/use-cases/payment/create-payment.use-case.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { CreatePaymentUseCase } from '../../../../src/application/use-cases/payment/create-payment.use-case'
import { TestDatabaseHelper } from '../../../helpers/test-database.helper'
import { MockFactory } from '../../../helpers/mock-factory.helper'

describe('CreatePaymentUseCase Integration', () => {
  let useCase: CreatePaymentUseCase
  let dbHelper: TestDatabaseHelper

  beforeEach(async () => {
    dbHelper = TestDatabaseHelper.getInstance()
    await dbHelper.setup()

    // Configurar use case com dependências reais
    useCase = new CreatePaymentUseCase(
      new PaymentRepository(dbHelper.getDrizzle()),
      new StripeGateway(),
      new TenantService(dbHelper.getDrizzle())
    )
  })

  afterEach(async () => {
    await dbHelper.cleanup()
  })

  it('should create payment successfully', async () => {
    // Arrange
    const tenant = MockFactory.createTenant()
    await dbHelper.seed({ tenants: [tenant] })

    const request = {
      amount: 10000,
      currency: 'BRL',
      tenantId: tenant.id,
      paymentMethod: 'card',
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    expect(result.id).toBeDefined()
    expect(result.amount).toBe(10000)
    expect(result.status).toBe('pending')
    expect(result.providerTransactionId).toBeDefined()
  })

  it('should throw error for invalid tenant', async () => {
    const request = {
      amount: 10000,
      currency: 'BRL',
      tenantId: 'invalid-tenant',
      paymentMethod: 'card',
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }

    await expect(useCase.execute(request)).rejects.toThrow('Tenant not found')
  })
})
```

### 6.3 Teste E2E - Payment Flow
```typescript
// tests/e2e/payment-flow/create-payment.e2e.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'
import { ApiClient } from '../../helpers/api-client.helper'
import { TestDatabaseHelper } from '../../helpers/test-database.helper'

describe('Payment Flow E2E', () => {
  let apiClient: ApiClient
  let dbHelper: TestDatabaseHelper
  let authToken: string

  beforeEach(async () => {
    apiClient = new ApiClient('http://localhost:3000')
    dbHelper = TestDatabaseHelper.getInstance()
    await dbHelper.setup()

    // Login para obter token
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password123',
      tenantId: 'tenant-123'
    })

    authToken = loginResponse.token
  })

  it('should complete payment flow successfully', async () => {
    // 1. Criar pagamento
    const createPaymentResponse = await apiClient.post('/payments', {
      amount: 10000,
      currency: 'BRL',
      paymentMethod: 'card',
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(createPaymentResponse.status).toBe('pending')
    expect(createPaymentResponse.id).toBeDefined()

    // 2. Capturar pagamento
    const captureResponse = await apiClient.post(`/payments/${createPaymentResponse.id}/capture`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(captureResponse.status).toBe('captured')

    // 3. Verificar status
    const statusResponse = await apiClient.get(`/payments/${createPaymentResponse.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(statusResponse.status).toBe('captured')
    expect(statusResponse.capturedAt).toBeDefined()
  })

  it('should handle payment failure gracefully', async () => {
    // Criar pagamento com dados inválidos
    const response = await apiClient.post('/payments', {
      amount: -1000, // Valor negativo
      currency: 'BRL',
      paymentMethod: 'card'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.statusCode).toBe(400)
    expect(response.error).toContain('Invalid amount')
  })
})
```

## 7. Scripts de Teste

### 7.1 Package.json Scripts
```json
{
  "scripts": {
    "test": "bun test",
    "test:unit": "bun test ./tests/unit",
    "test:integration": "bun test ./tests/integration",
    "test:e2e": "bun test ./tests/e2e",
    "test:performance": "bun test ./tests/performance",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:ci": "bun test --coverage --reporter=json",
    "test:debug": "bun test --inspect-brk",
    "test:setup": "bun run tests/setup/setup-test-db.ts",
    "test:cleanup": "bun run tests/setup/cleanup-test-db.ts"
  }
}
```

### 7.2 CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: payment_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Setup test database
        run: bun run test:setup

      - name: Run unit tests
        run: bun run test:unit

      - name: Run integration tests
        run: bun run test:integration

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Generate coverage report
        run: bun run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 8. Critérios de Aceitação

### 8.1 Cobertura de Testes
- [ ] Cobertura de código > 90%
- [ ] Todas as entidades de domínio testadas
- [ ] Todos os use cases testados
- [ ] Todos os controllers testados
- [ ] Todas as integrações externas testadas

### 8.2 Performance de Testes
- [ ] Testes unitários < 100ms cada
- [ ] Testes de integração < 5 segundos cada
- [ ] Testes E2E < 30 segundos cada
- [ ] Suite completa < 2 minutos
- [ ] Paralelização funcionando

### 8.3 Qualidade de Testes
- [ ] Testes determinísticos e repetíveis
- [ ] Isolamento entre testes
- [ ] Mocks e stubs funcionando
- [ ] Fixtures reutilizáveis
- [ ] Documentação de testes atualizada

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos
- **Risco**: Testes lentos impactando produtividade
  - **Mitigação**: Paralelização e otimização de queries
- **Risco**: Testes flaky (intermitentes)
  - **Mitigação**: Isolamento rigoroso e mocks consistentes

### 9.2 Riscos de Qualidade
- **Risco**: Baixa cobertura de testes
  - **Mitigação**: Gates de CI/CD e métricas obrigatórias
- **Risco**: Testes não refletem comportamento real
  - **Mitigação**: Testes E2E abrangentes e dados realistas

## 10. Cronograma

### Fase 1: Setup e Configuração (1 semana)
- Configuração do Bun test
- Setup do banco de dados de teste
- Criação de helpers e fixtures
- Configuração do CI/CD

### Fase 2: Testes Unitários (2 semanas)
- Testes das entidades de domínio
- Testes dos value objects
- Testes dos use cases
- Testes dos services

### Fase 3: Testes de Integração (1 semana)
- Testes com banco de dados
- Testes de APIs externas
- Testes de middleware
- Testes de repositories

### Fase 4: Testes E2E (1 semana)
- Testes de fluxos completos
- Testes de APIs públicas
- Testes de webhooks
- Testes de performance

## 11. Métricas de Sucesso

### 11.1 Métricas de Cobertura
- Cobertura de código: > 90%
- Cobertura de branches: > 85%
- Cobertura de funções: > 95%
- Cobertura de linhas: > 90%

### 11.2 Métricas de Performance
- Tempo total de testes: < 2 minutos
- Testes unitários: < 100ms cada
- Testes de integração: < 5 segundos cada
- Testes E2E: < 30 segundos cada

### 11.3 Métricas de Qualidade
- Zero bugs críticos em produção
- Taxa de sucesso de testes: > 99%
- Tempo de resolução de falhas: < 1 hora
- Satisfação dos desenvolvedores: > 8/10

## 12. Próximos Passos

1. **Configuração do ambiente de testes com Bun test**
2. **Setup do banco de dados de teste**
3. **Criação de helpers e fixtures reutilizáveis**
4. **Implementação de testes unitários com TDD**
5. **Desenvolvimento de testes de integração**
6. **Criação de testes E2E abrangentes**
7. **Configuração de testes de performance**
8. **Integração com CI/CD**
9. **Configuração de métricas e alertas**
10. **Documentação e treinamento da equipe**
