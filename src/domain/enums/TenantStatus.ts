/**
 * Enum para status de tenant
 */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

/**
 * Interface para informações de status de tenant
 */
export interface TenantStatusInfo {
  status: TenantStatus;
  label: string;
  description: string;
  color: string;
  canTransitionTo: TenantStatus[];
}

/**
 * Mapa de informações dos status de tenant
 */
export const TENANT_STATUS_INFO: Record<TenantStatus, TenantStatusInfo> = {
  [TenantStatus.ACTIVE]: {
    status: TenantStatus.ACTIVE,
    label: 'Ativo',
    description: 'Tenant ativo e funcionando normalmente',
    color: 'green',
    canTransitionTo: [TenantStatus.INACTIVE, TenantStatus.SUSPENDED]
  },
  [TenantStatus.INACTIVE]: {
    status: TenantStatus.INACTIVE,
    label: 'Inativo',
    description: 'Tenant inativo, mas pode ser reativado',
    color: 'gray',
    canTransitionTo: [TenantStatus.ACTIVE, TenantStatus.SUSPENDED]
  },
  [TenantStatus.SUSPENDED]: {
    status: TenantStatus.SUSPENDED,
    label: 'Suspenso',
    description: 'Tenant suspenso temporariamente',
    color: 'red',
    canTransitionTo: [TenantStatus.ACTIVE, TenantStatus.INACTIVE]
  },
  [TenantStatus.PENDING]: {
    status: TenantStatus.PENDING,
    label: 'Pendente',
    description: 'Tenant aguardando aprovação ou configuração',
    color: 'yellow',
    canTransitionTo: [TenantStatus.ACTIVE, TenantStatus.INACTIVE, TenantStatus.SUSPENDED]
  }
};

/**
 * Utilitários para status de tenant
 */
export class TenantStatusUtils {
  /**
   * Verifica se um status é ativo
   */
  static isActiveStatus(status: TenantStatus): boolean {
    return status === TenantStatus.ACTIVE;
  }

  /**
   * Verifica se um status é final
   */
  static isFinalStatus(status: TenantStatus): boolean {
    return status === TenantStatus.INACTIVE;
  }

  /**
   * Verifica se pode transicionar de um status para outro
   */
  static canTransitionTo(from: TenantStatus, to: TenantStatus): boolean {
    const statusInfo = TENANT_STATUS_INFO[from];
    return statusInfo.canTransitionTo.includes(to);
  }

  /**
   * Obtém informações de um status
   */
  static getStatusInfo(status: TenantStatus): TenantStatusInfo {
    return TENANT_STATUS_INFO[status];
  }

  /**
   * Obtém todos os status possíveis
   */
  static getAllStatuses(): TenantStatus[] {
    return Object.values(TenantStatus);
  }

  /**
   * Obtém status ativos
   */
  static getActiveStatuses(): TenantStatus[] {
    return this.getAllStatuses().filter(status => this.isActiveStatus(status));
  }

  /**
   * Obtém status inativos
   */
  static getInactiveStatuses(): TenantStatus[] {
    return this.getAllStatuses().filter(status => !this.isActiveStatus(status));
  }
}
