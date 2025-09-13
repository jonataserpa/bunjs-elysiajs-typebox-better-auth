import { Payment } from '../../../domain/entities/Payment';
import { Transaction } from '../../../domain/entities/Transaction';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus';
import { PaymentProvider } from '../../../domain/enums/PaymentProvider';

/**
 * Interface para repositório de pagamentos
 */
export interface PaymentRepository {
  /**
   * Salva um pagamento
   */
  save(payment: Payment): Promise<void>;

  /**
   * Busca pagamento por ID
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Busca pagamento por provider ID
   */
  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;

  /**
   * Busca pagamentos por tenant
   */
  findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Payment[]>;

  /**
   * Busca pagamentos por usuário
   */
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Payment[]>;

  /**
   * Lista todos os pagamentos
   */
  findAll(): Promise<Payment[]>;

  /**
   * Lista pagamentos com filtros
   */
  findWithFilters(filters: {
    tenantId?: string;
    userId?: string;
    status?: PaymentStatus;
    provider?: PaymentProvider;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Payment[]>;

  /**
   * Conta total de pagamentos
   */
  count(): Promise<number>;

  /**
   * Conta pagamentos ativos por tenant
   */
  countActiveByTenant(tenantId: string): Promise<number>;

  /**
   * Conta pagamentos com filtros
   */
  countWithFilters(filters: {
    tenantId?: string;
    userId?: string;
    status?: PaymentStatus;
    provider?: PaymentProvider;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<number>;

  /**
   * Busca transações por tenant
   */
  findTransactionsByTenantId(tenantId: string): Promise<Transaction[]>;

  /**
   * Busca transações por pagamento
   */
  findTransactionsByPaymentId(paymentId: string): Promise<Transaction[]>;

  /**
   * Deleta pagamento por ID (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Restaura pagamento deletado
   */
  restore(id: string): Promise<void>;
}
