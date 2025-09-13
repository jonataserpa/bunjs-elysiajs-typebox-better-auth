/**
 * DTOs para operações relacionadas a Transactions
 */

export interface CreateTransactionDTO {
  paymentId: string;
  tenantId: string;
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'fee';
  amount: number; // em reais
  providerTransactionId: string;
  providerData?: Record<string, any>;
}

export interface UpdateTransactionDTO {
  providerData?: Record<string, any>;
}

export interface TransactionResponseDTO {
  id: string;
  paymentId: string;
  tenantId: string;
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'fee';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  providerTransactionId: string;
  providerData: Record<string, any>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TransactionListDTO {
  id: string;
  paymentId: string;
  tenantId: string;
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'fee';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  providerTransactionId: string;
  processedAt?: string;
  createdAt: string;
}

export interface ProcessTransactionDTO {
  transactionId: string;
  processedBy: string;
}

export interface CompleteTransactionDTO {
  transactionId: string;
  completedBy: string;
  providerData?: Record<string, any>;
}

export interface FailTransactionDTO {
  transactionId: string;
  failureReason: string;
  failedBy: string;
}

export interface CancelTransactionDTO {
  transactionId: string;
  cancellationReason: string;
  cancelledBy: string;
}

export interface RetryTransactionDTO {
  transactionId: string;
  retriedBy: string;
}

export interface TransactionStatsDTO {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  averageTransactionValue: number;
  successRate: number;
}

export interface TransactionFilterDTO {
  paymentId?: string;
  tenantId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}
