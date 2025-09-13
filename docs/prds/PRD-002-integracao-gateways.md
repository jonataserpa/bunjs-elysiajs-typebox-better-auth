# PRD-002: Integração com Gateways de Pagamento

## 1. Visão Geral

### 1.1 Objetivo
Implementar integração robusta e flexível com múltiplos gateways de pagamento (Stripe e Pagar.me), utilizando arquitetura baseada em Strategy Pattern para suportar multi-tenancy e facilidade de extensão.

### 1.2 Escopo
- Integração com Stripe e Pagar.me
- Abstração de providers via Strategy Pattern
- Configuração multi-tenant de gateways
- Gestão segura de credenciais
- Tratamento de webhooks
- Sistema de fallback e resiliência

### 1.3 Critérios de Sucesso
- Suporte a múltiplos gateways simultaneamente
- Configuração independente por tenant
- Alta disponibilidade com fallback automático
- Segurança na gestão de credenciais
- Webhooks processados corretamente

## 2. Requisitos Funcionais

### 2.1 Integração com Gateways
- **RF-001**: Suporte nativo ao Stripe (cartões, PIX, boleto)
- **RF-002**: Suporte nativo ao Pagar.me (cartões, PIX, boleto)
- **RF-003**: Seleção dinâmica de gateway baseada no tenant
- **RF-004**: Configuração de credenciais por tenant
- **RF-005**: Suporte a modo sandbox e produção

### 2.2 Operações de Pagamento
- **RF-006**: Criação de transações de pagamento
- **RF-007**: Captura de pagamentos autorizados
- **RF-008**: Cancelamento de transações
- **RF-009**: Reembolso parcial e total
- **RF-010**: Consulta de status de transações
- **RF-011**: Histórico de transações por tenant

### 2.3 Webhooks e Notificações
- **RF-012**: Recebimento de webhooks do Stripe
- **RF-013**: Recebimento de webhooks do Pagar.me
- **RF-014**: Validação de assinatura de webhooks
- **RF-015**: Processamento assíncrono de eventos
- **RF-016**: Retry automático para falhas temporárias

### 2.4 Gestão de Credenciais
- **RF-017**: Armazenamento seguro de API keys
- **RF-018**: Rotação de credenciais
- **RF-019**: Validação de credenciais ativas
- **RF-020**: Configuração de webhook secrets

## 3. Requisitos Não Funcionais

### 3.1 Performance
- **RNF-001**: Tempo de resposta para operações de pagamento < 5 segundos
- **RNF-002**: Processamento de webhooks < 1 segundo
- **RNF-003**: Suporte a 1000+ transações simultâneas
- **RNF-004**: Cache de configurações de tenant

### 3.2 Segurança
- **RNF-005**: Criptografia de credenciais em repouso
- **RNF-006**: Validação rigorosa de webhooks
- **RNF-007**: Logs auditáveis de todas as operações
- **RNF-008**: Rate limiting por tenant

### 3.3 Confiabilidade
- **RNF-009**: Disponibilidade de 99.9%
- **RNF-010**: Fallback automático entre gateways
- **RNF-011**: Retry com backoff exponencial
- **RNF-012**: Idempotência em todas as operações

### 3.4 Escalabilidade
- **RNF-013**: Suporte a novos gateways sem refatoração
- **RNF-014**: Processamento paralelo de webhooks
- **RNF-015**: Load balancing entre instâncias

## 4. Arquitetura Proposta

### 4.1 Strategy Pattern Implementation
```
┌─────────────────────────────────────────────────────────────┐
│                    PaymentService                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PaymentProviderService                 │    │
│  │  ┌─────────────────┐  ┌─────────────────────────┐   │    │
│  │  │ StripeProvider  │  │    PagarmeProvider      │   │    │
│  │  │                 │  │                         │   │    │
│  │  │ - createPayment │  │ - createPayment         │   │    │
│  │  │ - capturePayment│  │ - capturePayment        │   │    │
│  │  │ - refundPayment │  │ - refundPayment         │   │    │
│  │  │ - getStatus     │  │ - getStatus             │   │    │
│  │  └─────────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                │
                    ┌─────────────────┐
                    │   TenantConfig  │
                    │                 │
                    │ - providerType  │
                    │ - apiKey        │
                    │ - webhookSecret │
                    │ - mode          │
                    └─────────────────┘
```

### 4.2 Estrutura de Dados
```typescript
// Configuração de Tenant
interface TenantPaymentConfig {
  tenantId: string
  provider: 'stripe' | 'pagarme'
  apiKey: string
  webhookSecret: string
  mode: 'sandbox' | 'production'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Transação unificada
interface PaymentTransaction {
  id: string
  tenantId: string
  providerTransactionId: string
  provider: 'stripe' | 'pagarme'
  amount: number
  currency: string
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  paymentMethod: 'card' | 'pix' | 'boleto'
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Webhook Event
interface WebhookEvent {
  id: string
  tenantId: string
  provider: 'stripe' | 'pagarme'
  eventType: string
  payload: any
  processed: boolean
  processedAt?: Date
  retryCount: number
  createdAt: Date
}
```

## 5. Especificações Técnicas

### 5.1 Dependências
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "pagarme": "^4.0.0",
    "crypto": "^1.0.1"
  }
}
```

### 5.2 Interface Base do Provider
```typescript
interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>
  capturePayment(transactionId: string, amount?: number): Promise<PaymentResponse>
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>
  getTransactionStatus(transactionId: string): Promise<PaymentStatus>
  validateWebhook(payload: any, signature: string): boolean
}
```

### 5.3 Implementação do Stripe Provider
```typescript
export class StripeProvider implements PaymentProvider {
  constructor(private config: TenantPaymentConfig) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2023-10-16'
    })
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency,
        payment_method: request.paymentMethodId,
        confirm: true,
        metadata: {
          tenantId: this.config.tenantId,
          ...request.metadata
        }
      })

      return {
        transactionId: paymentIntent.id,
        status: this.mapStatus(paymentIntent.status),
        providerData: paymentIntent
      }
    } catch (error) {
      throw new PaymentProviderError('Stripe payment creation failed', error)
    }
  }

  private mapStatus(stripeStatus: string): PaymentStatus {
    const statusMap = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'pending',
      'succeeded': 'captured',
      'requires_capture': 'authorized',
      'canceled': 'failed'
    }
    return statusMap[stripeStatus] || 'failed'
  }
}
```

### 5.4 Implementação do Pagar.me Provider
```typescript
export class PagarmeProvider implements PaymentProvider {
  constructor(private config: TenantPaymentConfig) {
    this.pagarme = require('pagarme')
    this.pagarme.client.connect({
      encryption_key: config.apiKey
    })
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const transaction = await this.pagarme.transactions.create({
        amount: request.amount,
        payment_method: this.mapPaymentMethod(request.paymentMethod),
        customer: {
          name: request.customer.name,
          email: request.customer.email,
          document_number: request.customer.document
        },
        metadata: {
          tenant_id: this.config.tenantId,
          ...request.metadata
        }
      })

      return {
        transactionId: transaction.id,
        status: this.mapStatus(transaction.status),
        providerData: transaction
      }
    } catch (error) {
      throw new PaymentProviderError('Pagar.me payment creation failed', error)
    }
  }
}
```

## 6. Webhooks

### 6.1 Endpoints de Webhook
```typescript
// Stripe Webhook
app.post('/webhooks/stripe/:tenantId', async ({ body, headers, params }) => {
  const signature = headers['stripe-signature']
  const tenantConfig = await getTenantConfig(params.tenantId)
  const provider = new StripeProvider(tenantConfig)

  if (!provider.validateWebhook(body, signature)) {
    return { error: 'Invalid signature' }, 400
  }

  await processWebhookEvent({
    tenantId: params.tenantId,
    provider: 'stripe',
    eventType: body.type,
    payload: body
  })

  return { received: true }
})

// Pagar.me Webhook
app.post('/webhooks/pagarme/:tenantId', async ({ body, params }) => {
  const tenantConfig = await getTenantConfig(params.tenantId)
  const provider = new PagarmeProvider(tenantConfig)

  if (!provider.validateWebhook(body, null)) {
    return { error: 'Invalid payload' }, 400
  }

  await processWebhookEvent({
    tenantId: params.tenantId,
    provider: 'pagarme',
    eventType: body.event,
    payload: body
  })

  return { received: true }
})
```

### 6.2 Processamento de Eventos
```typescript
async function processWebhookEvent(event: WebhookEvent) {
  // Salvar evento no banco
  await db.insert(webhookEvents).values(event)

  // Processar evento baseado no tipo
  switch (event.eventType) {
    case 'payment_intent.succeeded':
    case 'transaction.paid':
      await updateTransactionStatus(event.payload.id, 'captured')
      break
    case 'payment_intent.payment_failed':
    case 'transaction.refused':
      await updateTransactionStatus(event.payload.id, 'failed')
      break
    default:
      logger.info(`Unhandled webhook event: ${event.eventType}`)
  }
}
```

## 7. Gestão de Credenciais

### 7.1 Armazenamento Seguro
```typescript
class CredentialManager {
  async storeCredentials(tenantId: string, credentials: PaymentCredentials) {
    const encrypted = await this.encrypt(credentials)
    await db.insert(tenantPaymentConfigs).values({
      tenantId,
      apiKey: encrypted.apiKey,
      webhookSecret: encrypted.webhookSecret,
      provider: credentials.provider,
      mode: credentials.mode
    })
  }

  async getCredentials(tenantId: string): Promise<PaymentCredentials> {
    const config = await db.query.tenantPaymentConfigs.findFirst({
      where: eq(tenantPaymentConfigs.tenantId, tenantId)
    })

    return {
      apiKey: await this.decrypt(config.apiKey),
      webhookSecret: await this.decrypt(config.webhookSecret),
      provider: config.provider,
      mode: config.mode
    }
  }

  private async encrypt(data: string): Promise<string> {
    // Implementar criptografia AES-256
  }
}
```

## 8. Critérios de Aceitação

### 8.1 Funcionalidade
- [ ] Criação de pagamentos via Stripe funciona corretamente
- [ ] Criação de pagamentos via Pagar.me funciona corretamente
- [ ] Seleção de gateway baseada no tenant funciona
- [ ] Webhooks são recebidos e processados corretamente
- [ ] Operações de captura, cancelamento e reembolso funcionam
- [ ] Consulta de status de transações funciona

### 8.2 Segurança
- [ ] Credenciais são armazenadas de forma criptografada
- [ ] Webhooks são validados corretamente
- [ ] Logs de auditoria são gerados para todas as operações
- [ ] Rate limiting por tenant funciona

### 8.3 Performance
- [ ] Tempo de resposta para operações < 5 segundos
- [ ] Processamento de webhooks < 1 segundo
- [ ] Sistema suporta 1000+ transações simultâneas
- [ ] Fallback automático funciona em caso de falha

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos
- **Risco**: Mudanças nas APIs dos gateways
  - **Mitigação**: Versionamento de APIs e testes automatizados
- **Risco**: Falha de um gateway
  - **Mitigação**: Sistema de fallback automático

### 9.2 Riscos de Segurança
- **Risco**: Vazamento de credenciais
  - **Mitigação**: Criptografia e rotação regular de chaves
- **Risco**: Webhooks maliciosos
  - **Mitigação**: Validação rigorosa de assinaturas

## 10. Cronograma

### Fase 1: Estrutura Base (1 semana)
- Implementação do Strategy Pattern
- Interface base dos providers
- Configuração do banco de dados
- Testes unitários básicos

### Fase 2: Integração Stripe (1 semana)
- Implementação do StripeProvider
- Endpoints de webhook
- Testes de integração
- Documentação

### Fase 3: Integração Pagar.me (1 semana)
- Implementação do PagarmeProvider
- Adaptação de webhooks
- Testes de integração
- Validação de compatibilidade

### Fase 4: Sistema de Fallback (1 semana)
- Implementação de fallback automático
- Sistema de retry
- Monitoramento e alertas
- Testes de carga

## 11. Métricas de Sucesso

### 11.1 Métricas Operacionais
- Taxa de sucesso de transações: > 99%
- Tempo médio de processamento: < 3 segundos
- Disponibilidade do sistema: > 99.9%
- Taxa de webhooks processados: > 99.5%

### 11.2 Métricas de Qualidade
- Zero vazamentos de credenciais
- Tempo de resolução de incidentes: < 1 hora
- Cobertura de testes: > 90%
- Satisfação dos desenvolvedores: > 8/10

## 12. Próximos Passos

1. **Implementação da estrutura base do Strategy Pattern**
2. **Configuração do banco de dados para credenciais**
3. **Implementação do StripeProvider**
4. **Implementação do PagarmeProvider**
5. **Sistema de webhooks e processamento de eventos**
6. **Sistema de gestão segura de credenciais**
7. **Implementação de fallback e retry**
8. **Testes de integração e carga**
9. **Monitoramento e alertas**
10. **Documentação e treinamento da equipe**
