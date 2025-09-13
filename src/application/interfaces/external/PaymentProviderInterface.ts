import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';

/**
 * Interface para provedores de pagamento externos
 */
export interface PaymentProviderInterface {
  /**
   * Cria um pagamento no provedor externo
   */
  createPayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Autoriza um pagamento
   */
  authorizePayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Captura um pagamento autorizado
   */
  capturePayment(payment: Payment, tenant: Tenant, amount?: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Cancela um pagamento
   */
  cancelPayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Processa um reembolso
   */
  refundPayment(payment: Payment, tenant: Tenant, amount?: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Consulta o status de um pagamento
   */
  getPaymentStatus(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;

  /**
   * Valida webhook do provedor
   */
  validateWebhook(payload: string, signature: string, tenant: Tenant): Promise<{
    isValid: boolean;
    event?: any;
    error?: string;
  }>;

  /**
   * Processa webhook do provedor
   */
  processWebhook(event: any, tenant: Tenant): Promise<{
    success: boolean;
    action?: string;
    data?: any;
    error?: string;
  }>;
}

/**
 * Configurações do provedor de pagamento
 */
export interface PaymentProviderConfig {
  apiKey: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  timeout?: number;
  retries?: number;
}
