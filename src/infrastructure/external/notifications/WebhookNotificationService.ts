import type { NotificationServiceInterface, NotificationType, NotificationData, WebhookConfig } from '@/application/interfaces/external/NotificationServiceInterface';
import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';
import { logger } from '@/infrastructure/logging/Logger';
import { appConfig } from '@/shared/config/app.config';
import crypto from 'crypto';

/**
 * Implementação do serviço de notificações via webhook
 */
export class WebhookNotificationService implements NotificationServiceInterface {
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor() {
    this.timeout = appConfig.webhooks.timeout;
    this.maxRetries = appConfig.webhooks.maxRetries;
    this.retryDelay = appConfig.webhooks.retryDelay;
  }

  async sendWebhookNotification(
    tenant: Tenant,
    type: NotificationType,
    data: any,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const webhookUrl = tenant.settings.webhookUrl;
      
      if (!webhookUrl) {
        logger.warn('Webhook URL não configurada para tenant', 'WebhookNotificationService', {
          tenantId: tenant.id.getValue(),
          notificationType: type,
        });
        return { success: true }; // Não é um erro se webhook não estiver configurado
      }

      const notificationData: NotificationData = {
        id: crypto.randomUUID(),
        type,
        timestamp: new Date(),
        tenantId: tenant.id.getValue(),
        paymentId: payment?.id.getValue(),
        userId: payment?.userId?.getValue(),
        data,
        metadata: {
          tenantName: tenant.name,
          tenantSlug: tenant.slug.getValue(),
        },
      };

      const payload = JSON.stringify(notificationData);
      const signature = this.generateSignature(payload, tenant.settings.apiKeys?.webhook_secret);

      const result = await this.sendWebhookWithRetry(webhookUrl, payload, signature, 0);

      if (result.success) {
        logger.info('Webhook enviado com sucesso', 'WebhookNotificationService', {
          tenantId: tenant.id.getValue(),
          notificationType: type,
          webhookUrl,
        });
      }

      return result;
    } catch (error) {
      logger.error('Erro ao enviar webhook', error as Error, 'WebhookNotificationService', {
        tenantId: tenant.id.getValue(),
        notificationType: type,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async sendEmailNotification(
    tenant: Tenant,
    type: NotificationType,
    recipient: string,
    data: any,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    // TODO: Implementar integração com serviço de email
    logger.info('Email notification não implementado', 'WebhookNotificationService', {
      tenantId: tenant.id.getValue(),
      notificationType: type,
      recipient,
    });

    return { success: true };
  }

  async sendSmsNotification(
    tenant: Tenant,
    type: NotificationType,
    recipient: string,
    message: string,
    payment?: Payment
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    // TODO: Implementar integração com serviço de SMS
    logger.info('SMS notification não implementado', 'WebhookNotificationService', {
      tenantId: tenant.id.getValue(),
      notificationType: type,
      recipient,
    });

    return { success: true };
  }

  async validateWebhookConfig(tenant: Tenant): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const webhookUrl = tenant.settings.webhookUrl;
      
      if (!webhookUrl) {
        return {
          isValid: true, // Webhook não é obrigatório
        };
      }

      // Valida formato da URL
      try {
        new URL(webhookUrl);
      } catch {
        return {
          isValid: false,
          error: 'URL do webhook inválida',
        };
      }

      // Testa conectividade
      const testResult = await this.testWebhook(tenant);
      return {
        isValid: testResult.success,
        error: testResult.error,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro na validação',
      };
    }
  }

  async testWebhook(tenant: Tenant): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const webhookUrl = tenant.settings.webhookUrl;
      
      if (!webhookUrl) {
        return {
          success: true,
        };
      }

      const testData = {
        id: crypto.randomUUID(),
        type: 'test' as any,
        timestamp: new Date(),
        tenantId: tenant.id.getValue(),
        data: {
          message: 'Teste de webhook',
          test: true,
        },
        metadata: {
          tenantName: tenant.name,
          tenantSlug: tenant.slug.getValue(),
        },
      };

      const payload = JSON.stringify(testData);
      const signature = this.generateSignature(payload, tenant.settings.apiKeys?.webhook_secret);

      const result = await this.sendWebhookWithRetry(webhookUrl, payload, signature, 0);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no teste do webhook',
      };
    }
  }

  /**
   * Envia webhook com retry
   */
  private async sendWebhookWithRetry(
    url: string,
    payload: string,
    signature: string,
    attempt: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Payment-API/1.0',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': Date.now().toString(),
        },
        body: payload,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (attempt < this.maxRetries) {
        logger.warn('Webhook falhou, tentando novamente', 'WebhookNotificationService', {
          url,
          attempt: attempt + 1,
          error: errorMessage,
        });

        await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        return this.sendWebhookWithRetry(url, payload, signature, attempt + 1);
      }

      return {
        success: false,
        error: errorMessage,
      };
    } catch (error) {
      if (attempt < this.maxRetries) {
        logger.warn('Erro no webhook, tentando novamente', 'WebhookNotificationService', {
          url,
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });

        await this.delay(this.retryDelay * Math.pow(2, attempt));
        return this.sendWebhookWithRetry(url, payload, signature, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Gera assinatura HMAC para o webhook
   */
  private generateSignature(payload: string, secret?: string): string {
    if (!secret) {
      return '';
    }

    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
