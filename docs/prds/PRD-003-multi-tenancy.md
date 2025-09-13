# PRD-003: Sistema Multi-Tenancy

## 1. Visão Geral

### 1.1 Objetivo
Implementar um sistema multi-tenant robusto que permita isolamento completo de dados e configurações entre diferentes clientes (tenants), garantindo segurança, escalabilidade e flexibilidade de configuração.

### 1.2 Escopo
- Isolamento lógico de dados por tenant
- Sistema de autenticação multi-tenant
- Configurações específicas por tenant
- Middleware de contexto de tenant
- Auditoria e logs por tenant
- Gestão de limites e quotas

### 1.3 Critérios de Sucesso
- Isolamento completo de dados entre tenants
- Configuração independente por tenant
- Performance otimizada com muitos tenants
- Auditoria completa por tenant
- Escalabilidade horizontal

## 2. Requisitos Funcionais

### 2.1 Gestão de Tenants
- **RF-001**: Criação de novos tenants
- **RF-002**: Ativação/desativação de tenants
- **RF-003**: Configuração de limites por tenant
- **RF-004**: Gestão de quotas de uso
- **RF-005**: Configuração de gateway de pagamento por tenant
- **RF-006**: Configuração de webhooks por tenant

### 2.2 Isolamento de Dados
- **RF-007**: Todas as entidades possuem tenant_id
- **RF-008**: Filtros automáticos por tenant_id em todas as queries
- **RF-009**: Validação de tenant_id em todas as operações
- **RF-010**: Prevenção de vazamento de dados entre tenants
- **RF-011**: Backup e restore por tenant

### 2.3 Contexto de Tenant
- **RF-012**: Injeção automática de tenant_id no contexto
- **RF-013**: Middleware de validação de tenant
- **RF-014**: Suporte a header X-Tenant-ID para desenvolvimento
- **RF-015**: Validação de JWT com tenant_id
- **RF-016**: Logs estruturados com tenant_id

### 2.4 Auditoria e Monitoramento
- **RF-017**: Logs de todas as operações por tenant
- **RF-018**: Métricas de uso por tenant
- **RF-019**: Alertas de limite de quota
- **RF-020**: Dashboard de uso por tenant

## 3. Requisitos Não Funcionais

### 3.1 Segurança
- **RNF-001**: Isolamento rigoroso entre tenants
- **RNF-002**: Prevenção de SQL injection com tenant_id
- **RNF-003**: Criptografia de dados sensíveis por tenant
- **RNF-004**: Rate limiting por tenant

### 3.2 Performance
- **RNF-005**: Queries otimizadas com índices por tenant_id
- **RNF-006**: Cache de configurações por tenant
- **RNF-007**: Suporte a 10.000+ tenants simultâneos
- **RNF-008**: Tempo de resposta < 100ms para operações com tenant

### 3.3 Escalabilidade
- **RNF-009**: Escalabilidade horizontal sem impacto
- **RNF-010**: Particionamento de dados por tenant (futuro)
- **RNF-011**: Load balancing por tenant
- **RNF-012**: Migração de tenant entre instâncias

### 3.4 Observabilidade
- **RNF-013**: Logs estruturados com tenant_id
- **RNF-014**: Métricas por tenant em tempo real
- **RNF-015**: Alertas proativos por tenant
- **RNF-016**: Dashboard de saúde por tenant

## 4. Arquitetura Proposta

### 4.1 Modelo de Dados Multi-Tenant
```
┌─────────────────────────────────────────────────────────────┐
│                    Database Schema                          │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │    Tenants      │    │        All Entities            │ │
│  │                 │    │                                 │ │
│  │ - id            │    │ - id                            │ │
│  │ - name          │    │ - tenant_id (FK) ──────────────┼─┤
│  │ - domain        │    │ - created_at                    │ │
│  │ - config        │    │ - updated_at                    │ │
│  │ - is_active     │    │ - ...                           │ │
│  │ - created_at    │    │                                 │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Middleware de Contexto
```typescript
// Middleware de Tenant Context
export const withTenantContext = () => {
  return new Elysia()
    .derive({ as: 'scoped' }, async ({ headers, jwt }) => {
      let tenantId: string

      // 1. Tentar obter do JWT (produção)
      if (jwt?.tenantId) {
        tenantId = jwt.tenantId
      }
      // 2. Fallback para header (desenvolvimento/testes)
      else if (headers['x-tenant-id']) {
        tenantId = headers['x-tenant-id']
      }
      else {
        throw new Error('Tenant ID not found in request')
      }

      // 3. Validar se tenant existe e está ativo
      const tenant = await validateTenant(tenantId)
      if (!tenant || !tenant.isActive) {
        throw new Error('Invalid or inactive tenant')
      }

      return {
        tenant: tenant,
        tenantId: tenantId
      }
    })
}

// Middleware de validação de tenant
export const requireTenant = () => {
  return new Elysia()
    .guard({
      beforeHandle: async ({ tenantId, set }) => {
        if (!tenantId) {
          set.status = 401
          return { error: 'Tenant context required' }
        }
      }
    })
}
```

### 4.3 Schema de Dados
```typescript
// Schema do Tenant
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }).unique(),
  isActive: boolean('is_active').default(true).notNull(),
  config: jsonb('config').$type<TenantConfig>(),
  limits: jsonb('limits').$type<TenantLimits>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Configuração do Tenant
interface TenantConfig {
  paymentProvider: 'stripe' | 'pagarme'
  webhookUrl?: string
  features: {
    allowRefunds: boolean
    allowPartialRefunds: boolean
    requireApproval: boolean
  }
  branding?: {
    logo?: string
    primaryColor?: string
    companyName?: string
  }
}

// Limites do Tenant
interface TenantLimits {
  maxTransactionsPerMonth: number
  maxAmountPerTransaction: number
  maxDailyVolume: number
  allowedPaymentMethods: string[]
}

// Schema base para todas as entidades
export const createTenantAwareTable = <T extends Record<string, any>>(
  name: string,
  schema: T
) => {
  return pgTable(name, {
    ...schema,
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  })
}
```

## 5. Implementação Técnica

### 5.1 Serviço de Tenant
```typescript
export class TenantService {
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const tenant = await db.insert(tenants).values({
      name: data.name,
      domain: data.domain,
      config: data.config,
      limits: data.limits || this.getDefaultLimits()
    }).returning()

    // Criar configuração de pagamento padrão
    await this.createDefaultPaymentConfig(tenant[0].id)

    return tenant[0]
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    return await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    })
  }

  async updateTenantConfig(tenantId: string, config: Partial<TenantConfig>) {
    await db.update(tenants)
      .set({ 
        config: config,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
  }

  async validateTenantLimits(tenantId: string, amount: number): Promise<boolean> {
    const tenant = await this.getTenantById(tenantId)
    if (!tenant?.limits) return true

    // Verificar limite por transação
    if (amount > tenant.limits.maxAmountPerTransaction) {
      throw new TenantLimitExceededError('Transaction amount exceeds limit')
    }

    // Verificar limite diário
    const todayUsage = await this.getTodayUsage(tenantId)
    if (todayUsage + amount > tenant.limits.maxDailyVolume) {
      throw new TenantLimitExceededError('Daily volume limit exceeded')
    }

    return true
  }

  private getDefaultLimits(): TenantLimits {
    return {
      maxTransactionsPerMonth: 10000,
      maxAmountPerTransaction: 100000, // R$ 1.000,00
      maxDailyVolume: 1000000, // R$ 10.000,00
      allowedPaymentMethods: ['card', 'pix', 'boleto']
    }
  }
}
```

### 5.2 Query Builder com Tenant Context
```typescript
export class TenantAwareQueryBuilder {
  constructor(private tenantId: string) {}

  async findMany<T>(
    table: any,
    conditions: any = {}
  ): Promise<T[]> {
    return await db.query[table].findMany({
      where: and(
        eq(table.tenantId, this.tenantId),
        ...Object.entries(conditions).map(([key, value]) => 
          eq(table[key], value)
        )
      )
    })
  }

  async findFirst<T>(
    table: any,
    conditions: any = {}
  ): Promise<T | null> {
    return await db.query[table].findFirst({
      where: and(
        eq(table.tenantId, this.tenantId),
        ...Object.entries(conditions).map(([key, value]) => 
          eq(table[key], value)
        )
      )
    })
  }

  async insert<T>(
    table: any,
    data: Omit<T, 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    const result = await db.insert(table).values({
      ...data,
      tenantId: this.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return result[0]
  }

  async update<T>(
    table: any,
    data: Partial<T>,
    conditions: any = {}
  ): Promise<T[]> {
    return await db.update(table)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(
        eq(table.tenantId, this.tenantId),
        ...Object.entries(conditions).map(([key, value]) => 
          eq(table[key], value)
        )
      ))
      .returning()
  }

  async delete<T>(
    table: any,
    conditions: any = {}
  ): Promise<void> {
    await db.delete(table).where(and(
      eq(table.tenantId, this.tenantId),
      ...Object.entries(conditions).map(([key, value]) => 
        eq(table[key], value)
      )
    ))
  }
}
```

### 5.3 Middleware de Auditoria
```typescript
export const auditMiddleware = () => {
  return new Elysia()
    .onAfterHandle(async ({ request, tenantId, set }) => {
      // Log da operação
      await logger.info('API Request', {
        tenantId,
        method: request.method,
        url: request.url,
        statusCode: set.status,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })

      // Incrementar métricas
      await metrics.increment('api.requests', {
        tenant_id: tenantId,
        method: request.method,
        status_code: set.status.toString()
      })
    })
}
```

## 6. Configuração por Tenant

### 6.1 Configuração de Gateway
```typescript
export class TenantPaymentConfigService {
  async getPaymentProvider(tenantId: string): Promise<PaymentProvider> {
    const tenant = await tenantService.getTenantById(tenantId)
    if (!tenant?.config?.paymentProvider) {
      throw new Error('Payment provider not configured for tenant')
    }

    return tenant.config.paymentProvider
  }

  async updatePaymentProvider(
    tenantId: string, 
    provider: 'stripe' | 'pagarme',
    credentials: PaymentCredentials
  ) {
    await tenantService.updateTenantConfig(tenantId, {
      paymentProvider: provider
    })

    // Atualizar credenciais de forma segura
    await credentialManager.storeCredentials(tenantId, credentials)
  }
}
```

### 6.2 Configuração de Webhooks
```typescript
export class TenantWebhookConfigService {
  async getWebhookUrl(tenantId: string): Promise<string | null> {
    const tenant = await tenantService.getTenantById(tenantId)
    return tenant?.config?.webhookUrl || null
  }

  async setWebhookUrl(tenantId: string, url: string) {
    await tenantService.updateTenantConfig(tenantId, {
      webhookUrl: url
    })
  }

  async validateWebhookUrl(url: string): Promise<boolean> {
    try {
      new URL(url)
      return url.startsWith('https://')
    } catch {
      return false
    }
  }
}
```

## 7. Monitoramento e Métricas

### 7.1 Métricas por Tenant
```typescript
export class TenantMetricsService {
  async getTenantMetrics(tenantId: string, period: 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(period)
    
    return {
      transactionCount: await this.getTransactionCount(tenantId, startDate),
      totalVolume: await this.getTotalVolume(tenantId, startDate),
      averageTransactionValue: await this.getAverageTransactionValue(tenantId, startDate),
      successRate: await this.getSuccessRate(tenantId, startDate),
      topPaymentMethods: await this.getTopPaymentMethods(tenantId, startDate)
    }
  }

  async checkQuotaLimits(tenantId: string) {
    const tenant = await tenantService.getTenantById(tenantId)
    const metrics = await this.getTenantMetrics(tenantId, 'month')

    const alerts = []

    if (metrics.transactionCount > tenant.limits.maxTransactionsPerMonth * 0.9) {
      alerts.push({
        type: 'quota_warning',
        message: 'Approaching monthly transaction limit'
      })
    }

    return alerts
  }
}
```

## 8. Critérios de Aceitação

### 8.1 Isolamento de Dados
- [ ] Dados de um tenant não são acessíveis por outro tenant
- [ ] Todas as queries incluem filtro por tenant_id
- [ ] Validação de tenant_id em todas as operações
- [ ] Prevenção de SQL injection com tenant_id

### 8.2 Configuração por Tenant
- [ ] Cada tenant pode ter gateway de pagamento diferente
- [ ] Configurações de webhook independentes
- [ ] Limites e quotas configuráveis por tenant
- [ ] Features habilitáveis/desabilitáveis por tenant

### 8.3 Performance e Escalabilidade
- [ ] Suporte a 10.000+ tenants simultâneos
- [ ] Queries otimizadas com índices por tenant_id
- [ ] Cache de configurações por tenant
- [ ] Tempo de resposta < 100ms para operações com tenant

### 8.4 Auditoria e Monitoramento
- [ ] Logs estruturados com tenant_id
- [ ] Métricas por tenant em tempo real
- [ ] Alertas de limite de quota
- [ ] Dashboard de uso por tenant

## 9. Riscos e Mitigações

### 9.1 Riscos de Segurança
- **Risco**: Vazamento de dados entre tenants
  - **Mitigação**: Validação rigorosa de tenant_id e testes automatizados
- **Risco**: Ataques de tenant impersonation
  - **Mitigação**: Validação de JWT e logs de auditoria

### 9.2 Riscos de Performance
- **Risco**: Degradação com muitos tenants
  - **Mitigação**: Índices otimizados e particionamento futuro
- **Risco**: Cache invalidation complexa
  - **Mitigação**: Cache por tenant com TTL adequado

## 10. Cronograma

### Fase 1: Estrutura Base (1 semana)
- Implementação do schema de tenants
- Middleware de contexto de tenant
- Validação básica de tenant_id
- Testes unitários

### Fase 2: Isolamento de Dados (1 semana)
- Query builder com tenant context
- Validação em todas as operações
- Prevenção de vazamento de dados
- Testes de integração

### Fase 3: Configuração por Tenant (1 semana)
- Sistema de configuração flexível
- Gestão de credenciais por tenant
- Limites e quotas
- Testes de configuração

### Fase 4: Monitoramento e Auditoria (1 semana)
- Sistema de métricas por tenant
- Logs estruturados
- Alertas e dashboards
- Testes de monitoramento

## 11. Métricas de Sucesso

### 11.1 Métricas Operacionais
- Isolamento de dados: 100% (zero vazamentos)
- Tempo de resposta com tenant context: < 100ms
- Suporte a tenants simultâneos: > 10.000
- Disponibilidade do sistema: > 99.9%

### 11.2 Métricas de Qualidade
- Cobertura de testes: > 95%
- Tempo de resolução de incidentes: < 30 minutos
- Satisfação dos desenvolvedores: > 8/10
- Zero falhas de segurança relacionadas a multi-tenancy

## 12. Próximos Passos

1. **Implementação do schema de tenants e entidades base**
2. **Desenvolvimento do middleware de contexto de tenant**
3. **Criação do query builder com tenant awareness**
4. **Implementação do sistema de configuração por tenant**
5. **Desenvolvimento do sistema de métricas e monitoramento**
6. **Criação de testes automatizados para isolamento**
7. **Implementação de logs de auditoria**
8. **Configuração de alertas e dashboards**
9. **Testes de carga com múltiplos tenants**
10. **Documentação e treinamento da equipe**
