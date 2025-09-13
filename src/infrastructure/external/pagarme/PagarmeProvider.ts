import type { PaymentProviderInterface, PaymentProviderConfig } from '@/application/interfaces/external/PaymentProviderInterface';
import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';
import { PaymentStatus } from '@/domain/enums/PaymentStatus';
import { PaymentProvider } from '@/domain/enums/PaymentProvider';

/**
 * Implementação do provedor Pagar.me
 */
export class PagarmeProvider implements PaymentProviderInterface {
  private config: PaymentProviderConfig;
  private baseUrl: string;

  constructor(config: PaymentProviderConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.pagar.me/core/v5' 
      : 'https://api.pagar.me/core/v5';
  }

  async createPayment(payment: Payment, tenant: Tenant): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await this.makeRequest('POST', '/orders', {
        customer: {
          name: 'Cliente', // TODO: Obter dados do cliente do contexto
          email: 'cliente@exemplo.com', // TODO: Obter dados do cliente do contexto
          document: '00000000000', // TODO: Obter dados do cliente do contexto
        },
        items: [
          {
            name: payment.description?.getValue() || 'Pagamento',
            quantity: 1,
            unit_amount: payment.amount.getValue(),
          },
        ],
        payments: [
          {
            payment_method: 'credit_card',
            amount: payment.amount.getValue(),
            credit_card: {
              installments: 1,
              statement_descriptor: tenant.name,
              capture: true,
            },
          },
        ],
        metadata: {
          tenant_id: tenant.id.getValue(),
          payment_id: payment.id.getValue(),
          user_id: payment.userId?.getValue(),
        },
      });

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
          charges: response.charges,
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
      // No Pagar.me, a autorização é feita durante a criação
      const response = await this.makeRequest('GET', `/orders/${payment.providerPaymentId}`);

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
          charges: response.charges,
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
      // No Pagar.me, a captura é automática por padrão
      const response = await this.makeRequest('GET', `/orders/${payment.providerPaymentId}`);

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
          charges: response.charges,
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
      const response = await this.makeRequest('DELETE', `/orders/${payment.providerPaymentId}`);

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
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
      const refundData: any = {
        amount: amount || payment.amount.getValue(),
      };

      const response = await this.makeRequest('POST', `/charges/${payment.providerPaymentId}/refund`, refundData);

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
          amount: response.amount,
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
      const response = await this.makeRequest('GET', `/orders/${payment.providerPaymentId}`);

      return {
        success: true,
        data: {
          id: response.id,
          status: response.status,
          amount: response.amount,
          charges: response.charges,
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
      // No Pagar.me, a validação do webhook é feita via assinatura
      const webhookSecret = tenant.settings.apiKeys?.[PaymentProvider.PAGARME];
      if (!webhookSecret) {
        return {
          isValid: false,
          error: 'Webhook secret não configurado',
        };
      }

      // TODO: Implementar validação de assinatura do Pagar.me
      const event = JSON.parse(payload);

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
        case 'order.paid':
          return {
            success: true,
            action: 'payment_succeeded',
            data: {
              orderId: event.data.id,
              status: 'paid',
              amount: event.data.amount,
            },
          };

        case 'order.payment_failed':
          return {
            success: true,
            action: 'payment_failed',
            data: {
              orderId: event.data.id,
              status: 'failed',
              error: event.data.last_transaction,
            },
          };

        case 'order.canceled':
          return {
            success: true,
            action: 'payment_canceled',
            data: {
              orderId: event.data.id,
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
   * Faz requisição para a API do Pagar.me
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.config.apiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as any)?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Mapeia status do Pagar.me para status interno
   */
  static mapPagarmeStatusToInternal(pagarmeStatus: string): PaymentStatus {
    switch (pagarmeStatus) {
      case 'pending':
        return PaymentStatus.PENDING;
      case 'processing':
        return PaymentStatus.PENDING;
      case 'paid':
        return PaymentStatus.CAPTURED;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      case 'authorized':
        return PaymentStatus.AUTHORIZED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
