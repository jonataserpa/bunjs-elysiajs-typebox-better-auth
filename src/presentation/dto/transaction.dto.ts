import { t } from 'elysia';
import type { TSchema } from '@sinclair/typebox';

// DTO para resposta de uma transação
export const TransactionResponseDTO = t.Object({
  id: t.String(),
  paymentId: t.String(),
  tenantId: t.String(),
  type: t.String(),
  amount: t.Number(),
  status: t.String(),
  providerTransactionId: t.Union([t.String(), t.Null()]),
  providerData: t.Union([t.Record(t.String(), t.Any()), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

// DTO para lista de transações
export const TransactionListDTO = t.Object({
  id: t.String(),
  paymentId: t.String(),
  tenantId: t.String(),
  type: t.String(),
  amount: t.Number(),
  status: t.String(),
  providerTransactionId: t.Union([t.String(), t.Null()]),
  providerData: t.Union([t.Record(t.String(), t.Any()), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

// DTO para analytics de transações
export const TransactionAnalyticsDTO = t.Object({
  totalAmount: t.Number(),
  totalCount: t.Number(),
  successRate: t.Number(),
  averageAmount: t.Number(),
  byType: t.Record(t.String(), t.Number()),
  byStatus: t.Record(t.String(), t.Number()),
});

// DTO para resposta de analytics
export const TransactionAnalyticsResponseDTO = t.Object({
  success: t.Boolean(),
  data: TransactionAnalyticsDTO,
  timestamp: t.String(),
});

// DTO para resposta de lista de transações
export const TransactionListResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Array(TransactionListDTO),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
  timestamp: t.String(),
});

// DTO para resposta de uma transação
export const TransactionResponseResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Union([TransactionResponseDTO, t.Null()]),
  timestamp: t.String(),
});

// DTO para filtros de busca
export const TransactionFiltersDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
  type: t.Optional(t.String()),
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
});

// DTO para criação de transação
export const CreateTransactionDTO = t.Object({
  paymentId: t.String(),
  type: t.String(),
  amount: t.Number({ minimum: 1 }),
  status: t.String(),
  providerTransactionId: t.Optional(t.String()),
  providerData: t.Optional(t.Record(t.String(), t.Any())),
});

// DTO para atualização de transação
export const UpdateTransactionDTO = t.Object({
  status: t.Optional(t.String()),
  providerTransactionId: t.Optional(t.String()),
  providerData: t.Optional(t.Record(t.String(), t.Any())),
});

// DTO para resposta de criação/atualização
export const TransactionCreateResponseDTO = t.Object({
  success: t.Boolean(),
  data: TransactionResponseDTO,
  timestamp: t.String(),
});

// DTO para resposta de atualização
export const TransactionUpdateResponseDTO = t.Object({
  success: t.Boolean(),
  data: TransactionResponseDTO,
  timestamp: t.String(),
});

// DTO para resposta de erro
export const TransactionErrorResponseDTO = t.Object({
  success: t.Boolean(),
  error: t.String(),
  data: t.Null(),
  timestamp: t.String(),
});

// Tipos TypeScript para uso interno
export type TransactionDTO = {
  id: string;
  paymentId: string;
  tenantId: string;
  type: string;
  amount: number;
  status: string;
  providerTransactionId: string | null;
  providerData: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionListDTO = {
  id: string;
  paymentId: string;
  tenantId: string;
  type: string;
  amount: number;
  status: string;
  providerTransactionId: string | null;
  providerData: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionAnalyticsDTO = {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
};

export type CreateTransactionDTO = {
  paymentId: string;
  type: string;
  amount: number;
  status: string;
  providerTransactionId?: string;
  providerData?: Record<string, any>;
};

export type UpdateTransactionDTO = {
  status?: string;
  providerTransactionId?: string;
  providerData?: Record<string, any>;
};
