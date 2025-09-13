# 🔄 Fluxo de Pagamento - Payment API

## 📋 Visão Geral

Este documento descreve a **ordem de execução** e o **fluxo completo** de processamento de pagamentos na Payment API, desde a requisição da tela de compra até a finalização da transação.

## 🏗️ Arquitetura do Fluxo

### 1. **Payment (Entidade Principal)**
- Representa a **intenção de pagamento** de alto nível
- Contém dados de negócio (valor, descrição, metadados)
- Gerencia estados: `PENDING` → `AUTHORIZED` → `CAPTURED` / `FAILED` / `CANCELLED`

### 2. **Transaction (Entidade Técnica)**
- Representa **operações específicas** executadas nos provedores
- Rastreia cada interação com Stripe, Pagar.me, etc.
- Gerencia estados técnicos: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`

## 🔄 Fluxo Completo de Execução

### **Fase 1: Criação do Pagamento**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   🖥️ Frontend   │    │   🚀 Payment API  │    │   🗄️ Database   │    │ 💳 Provedor      │
│  Tela de Compra │    │                  │    │                 │    │ (Stripe/Pagar.me)│
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘
         │                        │                        │                        │
         │ POST /api/v1/payments  │                        │                        │
         ├───────────────────────►│                        │                        │
         │                        │                        │                        │
         │                        │ CreatePaymentUseCase   │                        │
         │                        │ .execute()             │                        │
         │                        │                        │                        │
         │                        │ 1. Validar dados       │                        │
         │                        │ 2. Buscar tenant       │                        │
         │                        │ 3. Gerar IDs únicos    │                        │
         │                        │ 4. Criar Payment       │                        │
         │                        │ 5. Validar regras      │                        │
         │                        │                        │                        │
         │                        │ Salvar Payment         │                        │
         │                        ├───────────────────────►│                        │
         │                        │ (status: PENDING)      │                        │
         │                        │                        │                        │
         │                        │ Enviar para operadora  │                        │
         │                        ├─────────────────────────────────────────────────►│
         │                        │                        │                        │
         │                        │ Resposta da operadora  │                        │
         │                        │◄─────────────────────────────────────────────────│
         │                        │                        │                        │
         │                        │                        │                        │
         │                        │ ┌─ Sucesso ─────────┐  │                        │
         │                        │ │ 9. Criar Transaction│ │                        │
         │                        │ │ 10. Salvar Transaction│ │                        │
         │                        │ │ 11. Atualizar Payment│ │                        │
         │                        │ │ 12. Salvar Payment  │ │                        │
         │                        │ └─────────────────────┘  │                        │
         │                        │                        │                        │
         │                        │ ┌─ Falha ─────────────┐ │                        │
         │                        │ │ 9. Falhar Payment   │ │                        │
         │                        │ │ 10. Salvar Payment  │ │                        │
         │                        │ │ (status: FAILED)    │ │                        │
         │                        │ └─────────────────────┘ │                        │
         │                        │                        │                        │
         │ Resposta com status    │                        │                        │
         │◄───────────────────────┤                        │                        │
         │                        │                        │                        │
```

### **Fase 2: Processamento Assíncrono (Webhooks)**

```
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ 💳 Provedor      │    │   🚀 Payment API  │    │   🗄️ Database   │    │ 📡 Event Handlers│
│ (Stripe/Pagar.me)│    │                  │    │                 │    │                  │
└──────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘
         │                        │                        │                        │
         │ Webhook Event          │                        │                        │
         │ /webhook/:provider     │                        │                        │
         ├───────────────────────►│                        │                        │
         │                        │                        │                        │
         │                        │ 1. Validar assinatura  │                        │
         │                        │ 2. Processar evento    │                        │
         │                        │                        │                        │
         │                        │                        │                        │
         │                        │ ┌─ Autorizado ────────┐ │                        │
         │                        │ │ 3. Buscar Payment   │ │                        │
         │                        │ │    e Transaction    │ │                        │
         │                        │ │ 4. Transaction      │ │                        │
         │                        │ │    (PROCESSING)     │ │                        │
         │                        │ │ 5. Autorizar Payment│ │                        │
         │                        │ │ 6. Salvar alterações│ │                        │
         │                        │ │ 7. Disparar Event   │ │                        │
         │                        │ └─────────────────────┘ │                        │
         │                        │                        │                        │
         │                        │ ┌─ Capturado ─────────┐ │                        │
         │                        │ │ 3. Buscar Payment   │ │                        │
         │                        │ │    e Transaction    │ │                        │
         │                        │ │ 4. Completar        │ │                        │
         │                        │ │    Transaction       │ │                        │
         │                        │ │ 5. Capturar Payment │ │                        │
         │                        │ │ 6. Salvar alterações│ │                        │
         │                        │ │ 7. Disparar Event   │ │                        │
         │                        │ └─────────────────────┘ │                        │
         │                        │                        │                        │
         │                        │ ┌─ Falhou ────────────┐ │                        │
         │                        │ │ 3. Buscar Payment   │ │                        │
         │                        │ │    e Transaction    │ │                        │
         │                        │ │ 4. Falhar           │ │                        │
         │                        │ │    Transaction       │ │                        │
         │                        │ │ 5. Falhar Payment   │ │                        │
         │                        │ │ 6. Salvar alterações│ │                        │
         │                        │ │ 7. Disparar Event   │ │                        │
         │                        │ └─────────────────────┘ │                        │
         │                        │                        │                        │
         │ Confirmação do webhook │                        │                        │
         │◄───────────────────────┤                        │                        │
         │                        │                        │                        │
```

## 📊 Estados e Transições

### **Payment States**
```
PENDING → AUTHORIZED → CAPTURED
    ↓         ↓           ↓
  FAILED   CANCELLED   REFUNDED
```

### **Transaction States**
```
PENDING → PROCESSING → COMPLETED
    ↓         ↓           ↓
  FAILED   CANCELLED   [Final]
```

## 🔧 Implementação Técnica

### **1. Criação do Pagamento**

```typescript
// CreatePaymentUseCase.execute()
async execute(dto: CreatePaymentDTO): Promise<PaymentResponseDTO> {
  // 1. Validação de dados
  const validation = PaymentValidator.validateCreate(dto);
  
  // 2. Buscar tenant
  const tenant = await this.tenantRepository.findById(dto.tenantId);
  
  // 3. Gerar IDs
  const paymentId = uuidv4();
  const providerPaymentId = this.generateProviderPaymentId(dto.provider);
  
  // 4. Criar entidade Payment
  const payment = PaymentMapper.fromCreateDTO(dto, paymentId, providerPaymentId);
  
  // 5. Validar regras de negócio
  const canProcess = PaymentDomainService.canProcessPayment(payment, tenant.settings);
  
  // 6. Salvar Payment (PENDING)
  await this.paymentRepository.save(payment);
  
  // 7. Enviar para operadora
  const providerResult = await this.providerService.createPayment(payment, tenant);
  
  // 8. Processar resposta
  if (providerResult.success) {
    // Criar Transaction
    const transaction = PaymentDomainService.createTransactionFromPayment(
      payment, 
      uuidv4(), 
      providerResult.data.id,
      providerResult.data
    );
    
    // Salvar Transaction
    await this.transactionRepository.save(transaction);
    
    // Atualizar Payment com dados do provedor
    payment.updateProviderData(providerResult.data);
    await this.paymentRepository.save(payment);
  } else {
    // Falhar Payment
    payment.fail(providerResult.error);
    await this.paymentRepository.save(payment);
  }
  
  return PaymentMapper.toResponseDTO(payment);
}
```

### **2. Processamento via Webhook**

```typescript
// ProcessPaymentUseCase.processWebhook()
async processWebhook(provider: PaymentProvider, payload: any): Promise<void> {
  // 1. Validar webhook
  const isValid = await this.validateWebhookSignature(provider, payload);
  
  // 2. Buscar Payment e Transaction
  const paymentId = payload.metadata.payment_id;
  const payment = await this.paymentRepository.findById(paymentId);
  const transaction = await this.transactionRepository.findByPaymentId(paymentId);
  
  // 3. Processar evento baseado no tipo
  switch (payload.type) {
    case 'payment_intent.authorized':
      transaction.startProcessing();
      payment.authorize();
      break;
      
    case 'payment_intent.succeeded':
      transaction.complete();
      payment.capture();
      break;
      
    case 'payment_intent.payment_failed':
      transaction.fail(payload.failure_reason);
      payment.fail(payload.failure_reason);
      break;
  }
  
  // 4. Salvar alterações
  await this.transactionRepository.save(transaction);
  await this.paymentRepository.save(payment);
  
  // 5. Disparar eventos de domínio
  await this.eventDispatcher.dispatch(new PaymentStatusChangedEvent(payment));
}
```

## 🎯 Resposta à sua Pergunta

**Sim, você entendeu corretamente o fluxo!** A ordem é exatamente:

1. **Requisição da tela** → API cria o **Payment** (PENDING)
2. **Envia para operadora** → Stripe/Pagar.me processa
3. **Retorno da operadora** → Cria **Transaction** + atualiza **Payment**
4. **Webhook assíncrono** → Atualiza ambos conforme status real

## 🔍 Pontos Importantes

### **Sincronização**
- **Payment** é criado **imediatamente** na requisição
- **Transaction** é criada **após** resposta da operadora
- **Webhooks** atualizam ambos **assincronamente**

### **Idempotência**
- Cada operação tem IDs únicos
- Webhooks são idempotentes (não duplicam operações)
- Estados são consistentes entre Payment e Transaction

### **Rastreabilidade**
- **Payment** = visão de negócio
- **Transaction** = histórico técnico detalhado
- **1 Payment** pode ter **N Transactions** (autorização + captura + reembolsos)

## 📈 Benefícios desta Arquitetura

1. **Separação de Responsabilidades**: Negócio vs Técnico
2. **Rastreabilidade Completa**: Histórico detalhado de todas as operações
3. **Resiliência**: Falhas em uma camada não afetam a outra
4. **Auditoria**: Log completo de todas as interações com provedores
5. **Flexibilidade**: Suporte a múltiplos provedores e cenários complexos

---

*Esta documentação reflete a implementação atual da Payment API e pode ser atualizada conforme novas funcionalidades forem implementadas.*
