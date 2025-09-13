# 🚀 Payment API - Collection do Insomnia

Esta collection contém todos os endpoints da Payment API organizados e prontos para uso no Insomnia.

## 📋 Como Importar

1. **Abra o Insomnia**
2. **Clique em "Import"** (ou use `Ctrl+I` / `Cmd+I`)
3. **Selecione "From File"**
4. **Escolha o arquivo** `Payment-API-Collection.json`
5. **Clique em "Import"**

## 🔧 Configuração Inicial

### 1. **Configurar Environment**

Após importar, configure as variáveis no **Base Environment**:

```json
{
  "base_url": "http://localhost:3000",
  "tenant_id": "seu-tenant-id-aqui",
  "payment_id": "seu-payment-id-aqui", 
  "provider": "stripe",
  "access_token": "seu-jwt-token-aqui",
  "refresh_token": "seu-refresh-token-aqui"
}
```

### 2. **Obter Tokens de Autenticação**

1. **Execute o endpoint "Login"** na pasta **🔐 Auth**
2. **Copie o `accessToken`** da resposta
3. **Cole no `access_token`** do environment
4. **Copie o `refreshToken`** da resposta  
5. **Cole no `refresh_token`** do environment

### 3. **Obter IDs Necessários**

- **`tenant_id`**: Use o ID retornado no login ou crie um tenant
- **`payment_id`**: Crie um pagamento e use o ID retornado
- **`provider`**: Use `stripe` ou `pagarme`

## 📁 Estrutura da Collection

### 🔐 **Auth** (5 endpoints)
- **Login** - POST `/api/v1/auth/login`
- **Registro** - POST `/api/v1/auth/register`  
- **Renovar Token** - POST `/api/v1/auth/refresh`
- **Logout** - POST `/api/v1/auth/logout`
- **Informações do Usuário** - GET `/api/v1/auth/me`

### 🏥 **Health** (3 endpoints)
- **Health Check** - GET `/health`
- **Readiness Check** - GET `/health/ready`
- **Liveness Check** - GET `/health/live`

### 💳 **Payments** (11 endpoints)
- **Listar Pagamentos** - GET `/api/v1/payments`
- **Buscar Pagamento por ID** - GET `/api/v1/payments/:id`
- **Criar Pagamento** - POST `/api/v1/payments`
- **Atualizar Pagamento** - PUT `/api/v1/payments/:id`
- **Capturar Pagamento** - POST `/api/v1/payments/:id/capture`
- **Cancelar Pagamento** - POST `/api/v1/payments/:id/cancel`
- **Estornar Pagamento** - POST `/api/v1/payments/:id/refund`
- **Estatísticas de Pagamentos** - GET `/api/v1/payments/stats`
- **Operações em Lote** - POST `/api/v1/payments/batch`
- **Webhook de Pagamento** - POST `/api/v1/payments/webhook/:provider`
- **Deletar Pagamento** - DELETE `/api/v1/payments/:id`

### 🏢 **Tenants** (7 endpoints)
- **Listar Tenants** - GET `/api/v1/tenants`
- **Buscar Tenant por ID** - GET `/api/v1/tenants/:id`
- **Criar Tenant** - POST `/api/v1/tenants`
- **Atualizar Tenant** - PUT `/api/v1/tenants/:id`
- **Deletar Tenant** - DELETE `/api/v1/tenants/:id`
- **Listar Usuários do Tenant** - GET `/api/v1/tenants/:id/users`
- **Estatísticas do Tenant** - GET `/api/v1/tenants/:id/stats`

## 🎯 **Fluxo de Teste Recomendado**

### **1. Teste Básico**
```
1. Health Check → Verificar se API está funcionando
2. Login → Obter tokens de autenticação
3. Informações do Usuário → Verificar autenticação
```

### **2. Teste de Pagamentos**
```
1. Listar Pagamentos → Ver pagamentos existentes
2. Criar Pagamento → Criar novo pagamento
3. Buscar Pagamento → Verificar pagamento criado
4. Capturar Pagamento → Processar pagamento
5. Estatísticas → Ver métricas
```

### **3. Teste de Tenants**
```
1. Listar Tenants → Ver tenants existentes
2. Criar Tenant → Criar novo tenant
3. Buscar Tenant → Verificar tenant criado
4. Atualizar Tenant → Modificar configurações
5. Estatísticas → Ver métricas do tenant
```

## 🔑 **Variáveis Disponíveis**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{{ _.base_url }}` | URL base da API | `http://localhost:3000` |
| `{{ _.tenant_id }}` | ID do tenant | `tenant-uuid-example` |
| `{{ _.payment_id }}` | ID do pagamento | `payment-uuid-example` |
| `{{ _.provider }}` | Provedor de pagamento | `stripe` ou `pagarme` |
| `{{ _.access_token }}` | Token JWT de acesso | `eyJhbGciOiJIUzI1NiIs...` |
| `{{ _.refresh_token }}` | Token JWT de refresh | `eyJhbGciOiJIUzI1NiIs...` |

## 📝 **Exemplos de Payload**

### **Criar Pagamento**
```json
{
  "amount": 100.00,
  "currency": "BRL",
  "provider": "stripe",
  "description": "Pagamento de teste",
  "metadata": {
    "order_id": "12345",
    "customer_id": "67890"
  },
  "expiresAt": "2025-02-13T23:59:59.000Z"
}
```

### **Criar Tenant**
```json
{
  "name": "Empresa Exemplo",
  "slug": "empresa-exemplo", 
  "email": "contato@empresaexemplo.com",
  "settings": {
    "allowedProviders": ["stripe", "pagarme"],
    "maxAmount": 10000,
    "minAmount": 1,
    "webhookUrl": "https://empresaexemplo.com/webhook"
  }
}
```

## 🚨 **Importante**

- **Todos os endpoints de autenticação** requerem tokens JWT válidos
- **Endpoints de pagamento** requerem `tenant_id` válido
- **Webhooks** são para uso dos provedores, não para testes manuais
- **Soft Delete** é usado em todos os endpoints de exclusão

## 🔗 **Links Úteis**

- **Swagger UI**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`
- **Documentação**: `docs/PAYMENT_FLOW.md`

---

*Collection criada para Payment API v1.0.0*
