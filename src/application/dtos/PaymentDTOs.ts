/**
 * DTOs para operações relacionadas a Payments
 */

export interface CreatePaymentDTO {
  tenantId: string;
  userId?: string;
  amount: number; // em reais
  currency: string;
  provider: 'stripe' | 'pagarme' | 'mercadopago';
  description: string;
  metadata?: Record<string, any>;
  expiresAt?: string; // ISO string
}

export interface UpdatePaymentDTO {
  description?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface PaymentResponseDTO {
  id: string;
  tenantId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  provider: 'stripe' | 'pagarme' | 'mercadopago';
  providerPaymentId: string;
  providerData: Record<string, any>;
  description: string;
  metadata: Record<string, any>;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaymentListDTO {
  id: string;
  tenantId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  provider: 'stripe' | 'pagarme' | 'mercadopago';
  providerPaymentId: string;
  description: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AuthorizePaymentDTO {
  paymentId: string;
  authorizedBy: string;
}

export interface CapturePaymentDTO {
  paymentId: string;
  capturedBy: string;
}

export interface FailPaymentDTO {
  paymentId: string;
  failureReason: string;
  failedBy: string;
}

export interface CancelPaymentDTO {
  paymentId: string;
  cancellationReason: string;
  cancelledBy: string;
}

export interface RefundPaymentDTO {
  paymentId: string;
  refundAmount?: number; // em reais, se não informado será reembolso total
  refundReason: string;
  refundedBy: string;
}

export interface ExtendPaymentExpirationDTO {
  paymentId: string;
  newExpiresAt: string; // ISO string
  extendedBy: string;
}

export interface PaymentStatsDTO {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  averagePaymentValue: number;
  successRate: number;
}

export interface PaymentFilterDTO {
  tenantId?: string;
  userId?: string;
  status?: string;
  provider?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}
