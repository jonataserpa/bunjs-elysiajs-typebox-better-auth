import { t } from 'elysia';
import { PaymentStatus, PaymentProvider } from '@/domain/enums';

/**
 * DTOs para operações de pagamento
 */

// DTO para criação de pagamento
export const CreatePaymentDTO = t.Object({
  tenantId: t.String({ minLength: 1, description: 'ID do tenant' }),
  userId: t.Optional(t.String({ minLength: 1, description: 'ID do usuário' })),
  amount: t.Number({ minimum: 0.01, description: 'Valor do pagamento' }),
  currency: t.String({ minLength: 3, maxLength: 3, description: 'Moeda (ISO 4217)' }),
  description: t.String({ minLength: 1, maxLength: 255, description: 'Descrição do pagamento' }),
  provider: t.Enum(PaymentProvider, { description: 'Provedor de pagamento' }),
  metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadados adicionais' })),
  expiresAt: t.Optional(t.String({ format: 'date-time', description: 'Data de expiração' })),
  customerInfo: t.Optional(t.Object({
    name: t.String({ minLength: 1, description: 'Nome do cliente' }),
    email: t.String({ format: 'email', description: 'Email do cliente' }),
    document: t.Optional(t.String({ description: 'Documento do cliente' })),
    phone: t.Optional(t.String({ description: 'Telefone do cliente' }))
  }))
});

// DTO para atualização de pagamento
export const UpdatePaymentDTO = t.Object({
  description: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  metadata: t.Optional(t.Record(t.String(), t.Any())),
  expiresAt: t.Optional(t.String({ format: 'date-time' }))
});

// DTO para captura de pagamento
export const CapturePaymentDTO = t.Object({
  amount: t.Optional(t.Number({ minimum: 0.01, description: 'Valor a capturar (opcional, captura total se não informado)' })),
  reason: t.Optional(t.String({ maxLength: 255, description: 'Motivo da captura' }))
});

// DTO para cancelamento de pagamento
export const CancelPaymentDTO = t.Object({
  reason: t.Optional(t.String({ maxLength: 255, description: 'Motivo do cancelamento' })),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
});

// DTO para reembolso de pagamento
export const RefundPaymentDTO = t.Object({
  amount: t.Optional(t.Number({ minimum: 0.01, description: 'Valor do reembolso (opcional, reembolso total se não informado)' })),
  reason: t.Optional(t.String({ maxLength: 255, description: 'Motivo do reembolso' })),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
});

// DTO de resposta para pagamento
export const PaymentResponseDTO = t.Object({
  id: t.String({ description: 'ID do pagamento' }),
  tenantId: t.String({ description: 'ID do tenant' }),
  userId: t.Optional(t.String({ description: 'ID do usuário' })),
  amount: t.Number({ description: 'Valor do pagamento' }),
  currency: t.String({ description: 'Moeda' }),
  status: t.Enum(PaymentStatus, { description: 'Status do pagamento' }),
  provider: t.Enum(PaymentProvider, { description: 'Provedor de pagamento' }),
  providerPaymentId: t.String({ description: 'ID do pagamento no provedor' }),
  description: t.String({ description: 'Descrição do pagamento' }),
  metadata: t.Record(t.String(), t.Any(), { description: 'Metadados' }),
  createdAt: t.String({ format: 'date-time', description: 'Data de criação' }),
  updatedAt: t.String({ format: 'date-time', description: 'Data de atualização' }),
  paidAt: t.Optional(t.String({ format: 'date-time', description: 'Data de pagamento' })),
  expiresAt: t.Optional(t.String({ format: 'date-time', description: 'Data de expiração' }))
});

// DTO para listagem de pagamentos
export const PaymentListQueryDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: t.Optional(t.String({ default: 'createdAt' })),
  order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' })),
  status: t.Optional(t.Enum(PaymentStatus, { description: 'Filtro por status' })),
  provider: t.Optional(t.Enum(PaymentProvider, { description: 'Filtro por provedor' })),
  userId: t.Optional(t.String({ description: 'Filtro por usuário' })),
  startDate: t.Optional(t.String({ format: 'date', description: 'Data inicial' })),
  endDate: t.Optional(t.String({ format: 'date', description: 'Data final' })),
  search: t.Optional(t.String({ description: 'Busca por descrição ou ID' }))
});

// DTO para estatísticas de pagamento
export const PaymentStatsQueryDTO = t.Object({
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
  groupBy: t.Optional(t.Union([
    t.Literal('day'),
    t.Literal('week'),
    t.Literal('month'),
    t.Literal('year')
  ], { default: 'day' })),
  status: t.Optional(t.Enum(PaymentStatus)),
  provider: t.Optional(t.Enum(PaymentProvider))
});

// DTO de resposta para estatísticas
export const PaymentStatsResponseDTO = t.Object({
  totalAmount: t.Number({ description: 'Valor total' }),
  totalCount: t.Number({ description: 'Quantidade total' }),
  averageAmount: t.Number({ description: 'Valor médio' }),
  statusBreakdown: t.Record(t.String(), t.Object({
    count: t.Number(),
    amount: t.Number()
  })),
  providerBreakdown: t.Record(t.String(), t.Object({
    count: t.Number(),
    amount: t.Number()
  })),
  timeline: t.Optional(t.Array(t.Object({
    date: t.String(),
    count: t.Number(),
    amount: t.Number()
  })))
});

// DTO para webhook de pagamento
export const PaymentWebhookDTO = t.Object({
  id: t.String({ description: 'ID do evento' }),
  type: t.String({ description: 'Tipo do evento' }),
  data: t.Record(t.String(), t.Any(), { description: 'Dados do evento' }),
  timestamp: t.String({ format: 'date-time', description: 'Timestamp do evento' }),
  signature: t.Optional(t.String({ description: 'Assinatura do webhook' }))
});

// DTO para validação de webhook
export const WebhookValidationDTO = t.Object({
  signature: t.String({ description: 'Assinatura do webhook' }),
  timestamp: t.Optional(t.String({ description: 'Timestamp do webhook' })),
  payload: t.String({ description: 'Payload do webhook' })
});

// DTO para resposta de webhook
export const WebhookResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  message: t.Optional(t.String()),
  processedAt: t.String({ format: 'date-time' })
});

// DTO para operações em lote de pagamentos
export const BatchPaymentOperationDTO = t.Object({
  operation: t.Union([
    t.Literal('capture'),
    t.Literal('cancel'),
    t.Literal('refund')
  ], { description: 'Tipo de operação' }),
  paymentIds: t.Array(t.String(), { minItems: 1, maxItems: 100, description: 'IDs dos pagamentos' }),
  reason: t.Optional(t.String({ maxLength: 255 })),
  metadata: t.Optional(t.Record(t.String(), t.Any()))
});

// DTO para resposta de operação em lote
export const BatchPaymentResponseDTO = t.Object({
  processed: t.Number(),
  successful: t.Number(),
  failed: t.Number(),
  results: t.Array(t.Object({
    paymentId: t.String(),
    success: t.Boolean(),
    error: t.Optional(t.String()),
    data: t.Optional(t.Any())
  }))
});

// DTO para filtros de busca
export const PaymentFiltersDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
  provider: t.Optional(t.String()),
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
});

// DTO para analytics de pagamentos
export const PaymentAnalyticsDTO = t.Object({
  totalAmount: t.Number(),
  totalCount: t.Number(),
  successRate: t.Number(),
  averageAmount: t.Number(),
  byProvider: t.Record(t.String(), t.Number()),
  byStatus: t.Record(t.String(), t.Number()),
});

// DTO para resposta de lista de pagamentos
export const PaymentListResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Array(PaymentResponseDTO),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
  timestamp: t.String(),
});

// DTO para resposta de um pagamento
export const PaymentResponseResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Union([PaymentResponseDTO, t.Null()]),
  timestamp: t.String(),
});

// DTO para resposta de analytics
export const PaymentAnalyticsResponseDTO = t.Object({
  success: t.Boolean(),
  data: PaymentAnalyticsDTO,
  timestamp: t.String(),
});

// DTO para pagamento (alias para PaymentResponseDTO)
export const PaymentDTO = PaymentResponseDTO;

// DTO para listagem de pagamentos (array de PaymentResponseDTO)
export const PaymentListDTO = t.Array(PaymentResponseDTO);

// Tipos TypeScript para uso interno
export type PaymentAnalyticsDTO = {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  byProvider: Record<string, number>;
  byStatus: Record<string, number>;
};
