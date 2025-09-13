import type { User, NewUser } from '@/infrastructure/database/schema';

export interface UserRepository {
  // Operações básicas
  create(data: NewUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  update(id: string, data: Partial<NewUser>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  
  // Operações por tenant
  findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<User[]>;
  findByTenantIdAndRole(tenantId: string, role: string): Promise<User[]>;
  findByTenantIdAndStatus(tenantId: string, status: string): Promise<User[]>;
  
  // Operações de autenticação
  findActiveByEmail(email: string, tenantId: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  
  // Operações de verificação
  exists(id: string): Promise<boolean>;
  emailExistsInTenant(email: string, tenantId: string, excludeId?: string): Promise<boolean>;
  
  // Operações de contagem
  countByTenantId(tenantId: string): Promise<number>;
  countByTenantIdAndStatus(tenantId: string, status: string): Promise<number>;
  countByTenantIdAndRole(tenantId: string, role: string): Promise<number>;
}
