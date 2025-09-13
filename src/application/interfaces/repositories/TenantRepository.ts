import { Tenant } from '../../../domain/entities/Tenant';

/**
 * Interface para repositório de tenants
 */
export interface TenantRepository {
  /**
   * Salva um tenant
   */
  save(tenant: Tenant): Promise<void>;

  /**
   * Busca tenant por ID
   */
  findById(id: string): Promise<Tenant | null>;

  /**
   * Busca tenant por slug
   */
  findBySlug(slug: string): Promise<Tenant | null>;

  /**
   * Busca tenant por email
   */
  findByEmail(email: string): Promise<Tenant | null>;

  /**
   * Lista todos os tenants
   */
  findAll(): Promise<Tenant[]>;

  /**
   * Lista tenants com filtros
   */
  findWithFilters(filters: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Tenant[]>;

  /**
   * Conta total de tenants
   */
  count(): Promise<number>;

  /**
   * Conta tenants com filtros
   */
  countWithFilters(filters: {
    status?: string;
  }): Promise<number>;

  /**
   * Verifica se existe tenant com slug
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Verifica se existe tenant com email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Deleta tenant por ID (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Restaura tenant deletado
   */
  restore(id: string): Promise<void>;
}
