import type { Payment, NewPayment } from '@/infrastructure/database/schema';

export interface PaymentRepository {
  // Operações básicas
  create(data: NewPayment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  update(id: string, data: Partial<NewPayment>): Promise<Payment | null>;
  delete(id: string): Promise<boolean>;
  
  // Operações por tenant
  findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Payment[]>;
  findByTenantIdAndStatus(tenantId: string, status: string): Promise<Payment[]>;
  findByTenantIdAndProvider(tenantId: string, provider: string): Promise<Payment[]>;
  
  // Operações por usuário
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Payment[]>;
  findByUserIdAndStatus(userId: string, status: string): Promise<Payment[]>;
  
  // Operações por provider
  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
  findByProviderAndPaymentId(provider: string, providerPaymentId: string): Promise<Payment | null>;
  
  // Operações de busca
  findByStatus(status: string, limit?: number, offset?: number): Promise<Payment[]>;
  findByProvider(provider: string, limit?: number, offset?: number): Promise<Payment[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId?: string): Promise<Payment[]>;
  
  // Operações de verificação
  exists(id: string): Promise<boolean>;
  providerPaymentIdExists(providerPaymentId: string): Promise<boolean>;
  
  // Operações de contagem
  countByTenantId(tenantId: string): Promise<number>;
  countByTenantIdAndStatus(tenantId: string, status: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
  countByStatus(status: string): Promise<number>;
  
  // Operações de agregação
  getTotalAmountByTenantId(tenantId: string): Promise<number>;
  getTotalAmountByTenantIdAndStatus(tenantId: string, status: string): Promise<number>;
  getTotalAmountByDateRange(startDate: Date, endDate: Date, tenantId?: string): Promise<number>;
}
