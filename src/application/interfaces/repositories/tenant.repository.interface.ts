import type { Tenant, NewTenant } from '@/infrastructure/database/schema';

export interface TenantRepository {
  // Operações básicas
  create(data: NewTenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  update(id: string, data: Partial<NewTenant>): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
  
  // Operações de listagem
  findAll(limit?: number, offset?: number): Promise<Tenant[]>;
  findByStatus(status: string): Promise<Tenant[]>;
  
  // Operações de verificação
  exists(id: string): Promise<boolean>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  emailExists(email: string, excludeId?: string): Promise<boolean>;
  
  // Operações de contagem
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
}
