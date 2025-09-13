import Stripe from 'stripe';
import type { PaymentProviderInterface, PaymentProviderConfig } from '@/application/interfaces/external/PaymentProviderInterface';
import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';
import { PaymentStatus } from '@/domain/enums/PaymentStatus';
import { PaymentProvider } from '@/domain/enums/PaymentProvider';

/**
 * Implementação do provedor Stripe
 */
export class StripeProvider implements PaymentProviderInterface {
  private stripe: Stripe;

  constructor(config: PaymentProviderConfig) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2025-08-27.basil',
      timeout: config.timeout || 30000,
      maxNetworkRetries: config.retries || 3,
    });
  }

  async createPayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: payment.amount.getValue(),
        currency: payment.currency.getValue().toLowerCase(),
        metadata: {
          tenantId: tenant.id.getValue(),
          paymentId: payment.id.getValue(),
          userId: payment.userId?.getValue() || null,
        },
        description: payment.description?.getValue(),
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async authorizePayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(payment.providerPaymentId, {
        payment_method: 'pm_card_visa', // TODO: Obter do contexto do pagamento
      });

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao autorizar pagamento',
      };
    }
  }

  async capturePayment(payment: Payment, tenant: Tenant, amount?: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const captureOptions: any = {};
      if (amount && amount < payment.amount.getValue()) {
        captureOptions.amount_to_capture = amount;
      }

      const paymentIntent = await this.stripe.paymentIntents.capture(
        payment.providerPaymentId,
        captureOptions
      );

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount_captured: paymentIntent.amount_received,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao capturar pagamento',
      };
    }
  }

  async cancelPayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(payment.providerPaymentId);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar pagamento',
      };
    }
  }

  async refundPayment(payment: Payment, tenant: Tenant, amount?: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const refundOptions: any = {
        payment_intent: payment.providerPaymentId,
      };

      if (amount && amount < payment.amount.getValue()) {
        refundOptions.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundOptions);

      return {
        success: true,
        data: {
          id: refund.id,
          status: refund.status,
          amount: refund.amount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar reembolso',
      };
    }
  }

  async getPaymentStatus(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.providerPaymentId);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          amount_received: paymentIntent.amount_received,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao consultar status',
      };
    }
  }

  async validateWebhook(payload: string, signature: string, tenant: Tenant): Promise<{
    isValid: boolean;
    event?: any;
    error?: string;
  }> {
    try {
      const webhookSecret = tenant.settings.apiKeys?.[PaymentProvider.STRIPE];
      if (!webhookSecret) {
        return {
          isValid: false,
          error: 'Webhook secret não configurado',
        };
      }

      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      return {
        isValid: true,
        event,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro na validação do webhook',
      };
    }
  }

  async processWebhook(event: any, tenant: Tenant): Promise<{
    success: boolean;
    action?: string;
    data?: any;
    error?: string;
  }> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return {
            success: true,
            action: 'payment_succeeded',
            data: {
              paymentId: event.data.object.id,
              status: 'succeeded',
              amount: event.data.object.amount,
            },
          };

        case 'payment_intent.payment_failed':
          return {
            success: true,
            action: 'payment_failed',
            data: {
              paymentId: event.data.object.id,
              status: 'failed',
              error: event.data.object.last_payment_error,
            },
          };

        case 'payment_intent.canceled':
          return {
            success: true,
            action: 'payment_canceled',
            data: {
              paymentId: event.data.object.id,
              status: 'canceled',
            },
          };

        default:
          return {
            success: true,
            action: 'unknown_event',
            data: event,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar webhook',
      };
    }
  }

  /**
   * Mapeia status do Stripe para status interno
   */
  static mapStripeStatusToInternal(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
        return PaymentStatus.PENDING;
      case 'requires_action':
        return PaymentStatus.PENDING;
      case 'processing':
        return PaymentStatus.PENDING;
      case 'succeeded':
        return PaymentStatus.CAPTURED;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      case 'requires_capture':
        return PaymentStatus.AUTHORIZED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
