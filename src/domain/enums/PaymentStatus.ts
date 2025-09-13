/**
 * Enum para status de pagamento
 */
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

/**
 * Interface para informações de status
 */
export interface PaymentStatusInfo {
  status: PaymentStatus;
  label: string;
  description: string;
  color: string;
  canTransitionTo: PaymentStatus[];
}

/**
 * Mapa de informações dos status
 */
export const PAYMENT_STATUS_INFO: Record<PaymentStatus, PaymentStatusInfo> = {
  [PaymentStatus.PENDING]: {
    status: PaymentStatus.PENDING,
    label: 'Pendente',
    description: 'Pagamento aguardando processamento',
    color: 'yellow',
    canTransitionTo: [PaymentStatus.AUTHORIZED, PaymentStatus.FAILED, PaymentStatus.CANCELLED]
  },
  [PaymentStatus.AUTHORIZED]: {
    status: PaymentStatus.AUTHORIZED,
    label: 'Autorizado',
    description: 'Pagamento autorizado, aguardando captura',
    color: 'blue',
    canTransitionTo: [PaymentStatus.CAPTURED, PaymentStatus.CANCELLED]
  },
  [PaymentStatus.CAPTURED]: {
    status: PaymentStatus.CAPTURED,
    label: 'Capturado',
    description: 'Pagamento capturado com sucesso',
    color: 'green',
    canTransitionTo: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]
  },
  [PaymentStatus.FAILED]: {
    status: PaymentStatus.FAILED,
    label: 'Falhou',
    description: 'Pagamento falhou no processamento',
    color: 'red',
    canTransitionTo: []
  },
  [PaymentStatus.CANCELLED]: {
    status: PaymentStatus.CANCELLED,
    label: 'Cancelado',
    description: 'Pagamento cancelado',
    color: 'gray',
    canTransitionTo: []
  },
  [PaymentStatus.REFUNDED]: {
    status: PaymentStatus.REFUNDED,
    label: 'Reembolsado',
    description: 'Pagamento totalmente reembolsado',
    color: 'orange',
    canTransitionTo: []
  },
  [PaymentStatus.PARTIALLY_REFUNDED]: {
    status: PaymentStatus.PARTIALLY_REFUNDED,
    label: 'Parcialmente Reembolsado',
    description: 'Pagamento parcialmente reembolsado',
    color: 'orange',
    canTransitionTo: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]
  }
};

/**
 * Utilitários para status de pagamento
 */
export class PaymentStatusUtils {
  /**
   * Verifica se um status é final
   */
  static isFinalStatus(status: PaymentStatus): boolean {
    return [
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.REFUNDED
    ].includes(status);
  }

  /**
   * Verifica se um status é ativo
   */
  static isActiveStatus(status: PaymentStatus): boolean {
    return [
      PaymentStatus.PENDING,
      PaymentStatus.AUTHORIZED,
      PaymentStatus.CAPTURED,
      PaymentStatus.PARTIALLY_REFUNDED
    ].includes(status);
  }

  /**
   * Verifica se pode transicionar de um status para outro
   */
  static canTransitionTo(from: PaymentStatus, to: PaymentStatus): boolean {
    const statusInfo = PAYMENT_STATUS_INFO[from];
    return statusInfo.canTransitionTo.includes(to);
  }

  /**
   * Obtém informações de um status
   */
  static getStatusInfo(status: PaymentStatus): PaymentStatusInfo {
    return PAYMENT_STATUS_INFO[status];
  }

  /**
   * Obtém todos os status possíveis
   */
  static getAllStatuses(): PaymentStatus[] {
    return Object.values(PaymentStatus);
  }

  /**
   * Obtém status finais
   */
  static getFinalStatuses(): PaymentStatus[] {
    return this.getAllStatuses().filter(status => this.isFinalStatus(status));
  }

  /**
   * Obtém status ativos
   */
  static getActiveStatuses(): PaymentStatus[] {
    return this.getAllStatuses().filter(status => this.isActiveStatus(status));
  }
}
