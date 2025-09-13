import { User } from '../../../domain/entities/User';

/**
 * Interface para repositório de usuários
 */
export interface UserRepository {
  /**
   * Salva um usuário
   */
  save(user: User): Promise<void>;

  /**
   * Busca usuário por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca usuário por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca usuários por tenant
   */
  findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<User[]>;

  /**
   * Lista todos os usuários
   */
  findAll(): Promise<User[]>;

  /**
   * Lista usuários com filtros
   */
  findWithFilters(filters: {
    tenantId?: string;
    status?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;

  /**
   * Conta total de usuários
   */
  count(): Promise<number>;

  /**
   * Conta usuários com filtros
   */
  countWithFilters(filters: {
    tenantId?: string;
    status?: string;
    role?: string;
  }): Promise<number>;

  /**
   * Verifica se existe usuário com email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Verifica se existe usuário com email no tenant
   */
  existsByEmailInTenant(email: string, tenantId: string): Promise<boolean>;

  /**
   * Deleta usuário por ID (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Restaura usuário deletado
   */
  restore(id: string): Promise<void>;
}
