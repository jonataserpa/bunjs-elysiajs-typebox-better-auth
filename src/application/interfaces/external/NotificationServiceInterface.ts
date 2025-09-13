import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';

/**
 * Tipos de notificação
 */
export enum NotificationType {
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYMENT_CAPTURED = 'payment_captured',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  PAYMENT_REFUNDED = 'payment_refunded',
  WEBHOOK_FAILED = 'webhook_failed',
  TENANT_SUSPENDED = 'tenant_suspended',
  USER_CREATED = 'user_created',
  USER_LOGIN = 'user_login',
}

/**
 * Interface para serviços de notificação
 */
export interface NotificationServiceInterface {
  /**
   * Envia notificação via webhook
   */
  sendWebhookNotification(
    tenant: Tenant,
    type: NotificationType,
    data: any,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Envia notificação por email
   */
  sendEmailNotification(
    tenant: Tenant,
    type: NotificationType,
    recipient: string,
    data: any,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Envia notificação por SMS
   */
  sendSmsNotification(
    tenant: Tenant,
    type: NotificationType,
    recipient: string,
    message: string,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Valida configurações de webhook
   */
  validateWebhookConfig(tenant: Tenant): Promise<{
    isValid: boolean;
    error?: string;
  }>;

  /**
   * Testa webhook
   */
  testWebhook(tenant: Tenant): Promise<{
    success: boolean;
    error?: string;
  }>;
}

/**
 * Dados da notificação
 */
export interface NotificationData {
  id: string;
  type: NotificationType;
  timestamp: Date;
  tenantId: string;
  paymentId?: string;
  userId?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Configurações de webhook
 */
export interface WebhookConfig {
  url: string;
  secret?: string;
  events: NotificationType[];
  timeout: number;
  retries: number;
  retryDelay: number;
}
