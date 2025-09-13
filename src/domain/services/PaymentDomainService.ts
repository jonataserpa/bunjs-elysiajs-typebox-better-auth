import { Payment } from '../entities/Payment';
import { PaymentStatus } from '../enums/PaymentStatus';
import { PaymentProvider } from '../enums/PaymentProvider';
import { Transaction, TransactionType } from '../entities/Transaction';
import { Money } from '../value-objects/Money';
import { TenantSettings } from '../entities/Tenant';

/**
 * Domain Service para regras de negócio relacionadas a pagamentos
 * Contém lógica que não pertence a uma única entidade
 */
export class PaymentDomainService {
  /**
   * Valida se um pagamento pode ser processado para um tenant
   */
  static canProcessPayment(
    payment: Payment,
    tenantSettings: TenantSettings
  ): { canProcess: boolean; reason?: string } {
    // Verificar se o tenant está ativo
    if (payment.status === PaymentStatus.FAILED) {
      return { canProcess: false, reason: 'Pagamento já falhou' };
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      return { canProcess: false, reason: 'Pagamento foi cancelado' };
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      return { canProcess: false, reason: 'Pagamento foi reembolsado' };
    }

    // Verificar se o pagamento não expirou
    if (payment.isExpired) {
      return { canProcess: false, reason: 'Pagamento expirado' };
    }

    // Verificar se o valor está dentro do limite do tenant
    const maxAmount = tenantSettings.apiKeys?.maxPaymentAmount 
      ? parseInt(tenantSettings.apiKeys.maxPaymentAmount) 
      : 100000; // R$ 1000,00 padrão

    if (payment.amount.getValue() > maxAmount) {
      return { 
        canProcess: false, 
        reason: `Valor excede o limite máximo de R$ ${maxAmount / 100}` 
      };
    }

    // Verificar se o provider é permitido
    const allowedProviders = tenantSettings.paymentMethods || [];
    if (!allowedProviders.includes(payment.provider)) {
      return { 
        canProcess: false, 
        reason: `Provider ${payment.provider} não é permitido para este tenant` 
      };
    }

    return { canProcess: true };
  }

  /**
   * Calcula a taxa do provider baseado no valor e tipo de pagamento
   */
  static calculateProviderFee(
    amount: Money,
    provider: PaymentProvider,
    paymentType: string = 'card'
  ): Money {
    let feePercentage: number;

    switch (provider) {
      case PaymentProvider.STRIPE:
        feePercentage = paymentType === 'card' ? 0.0349 : 0.0149; // 3.49% ou 1.49%
        break;
      case PaymentProvider.PAGARME:
        feePercentage = paymentType === 'card' ? 0.0399 : 0.0199; // 3.99% ou 1.99%
        break;
      // case PaymentProvider.MERCADOPAGO:
      //   feePercentage = paymentType === 'card' ? 0.0499 : 0.0299; // 4.99% ou 2.99%
      //   break;
      default:
        feePercentage = 0.0399; // 3.99% padrão
    }

    // Calcular taxa mínima (R$ 0,50)
    const minimumFee = Money.fromReais(0.50);
    const calculatedFee = amount.multiply(feePercentage);

    return calculatedFee.getValue() > minimumFee.getValue() ? calculatedFee : minimumFee;
  }

  /**
   * Calcula o valor líquido após descontar as taxas
   */
  static calculateNetAmount(
    amount: Money,
    provider: PaymentProvider,
    paymentType: string = 'card'
  ): Money {
    const fee = this.calculateProviderFee(amount, provider, paymentType);
    return amount.subtract(fee);
  }

  /**
   * Valida se um reembolso pode ser processado
   */
  static canProcessRefund(
    payment: Payment,
    refundAmount?: number
  ): { canRefund: boolean; reason?: string; maxRefundAmount?: number } {
    // Verificar se já foi reembolsado totalmente primeiro
    if (payment.isRefunded) {
      return { canRefund: false, reason: 'Pagamento já foi totalmente reembolsado' };
    }

    if (!payment.canBeRefunded) {
      return { canRefund: false, reason: 'Pagamento não pode ser reembolsado' };
    }

    if (!payment.isCaptured && !payment.isPartiallyRefunded) {
      return { canRefund: false, reason: 'Pagamento não foi capturado' };
    }

    // Calcular valor máximo de reembolso
    const maxRefundAmount = payment.amount.getValue();
    
    if (refundAmount !== undefined) {
      const refundAmountCents = Math.round(refundAmount * 100);
      
      if (refundAmountCents <= 0) {
        return { 
          canRefund: false, 
          reason: 'Valor do reembolso deve ser maior que zero'
        };
      }

      if (refundAmountCents > maxRefundAmount) {
        return { 
          canRefund: false, 
          reason: 'Valor do reembolso excede o valor do pagamento',
          maxRefundAmount: maxRefundAmount / 100
        };
      }
    }

    return { canRefund: true, maxRefundAmount: maxRefundAmount / 100 };
  }

  /**
   * Determina o próximo status de um pagamento baseado na resposta do provider
   */
  static determineNextPaymentStatus(
    currentStatus: PaymentStatus,
    providerResponse: any
  ): PaymentStatus {
    switch (currentStatus) {
      case PaymentStatus.PENDING:
        if (providerResponse.status === 'succeeded') {
          return PaymentStatus.CAPTURED;
        }
        if (providerResponse.status === 'requires_action') {
          return PaymentStatus.AUTHORIZED;
        }
        if (providerResponse.status === 'failed') {
          return PaymentStatus.FAILED;
        }
        return PaymentStatus.PENDING;

      case PaymentStatus.AUTHORIZED:
        if (providerResponse.status === 'succeeded') {
          return PaymentStatus.CAPTURED;
        }
        if (providerResponse.status === 'failed') {
          return PaymentStatus.FAILED;
        }
        return PaymentStatus.AUTHORIZED;

      default:
        return currentStatus;
    }
  }

  /**
   * Cria uma transação baseada em um pagamento
   */
  static createTransactionFromPayment(
    payment: Payment,
    transactionId: string,
    providerTransactionId: string,
    providerData?: Record<string, any>
  ): Transaction {
    const transactionType = this.getTransactionTypeFromPayment(payment);
    
    return Transaction.create(
      transactionId,
      payment.id.getValue(),
      payment.tenantId.getValue(),
      transactionType,
      payment.amount.toReais(),
      providerTransactionId,
      providerData
    );
  }

  /**
   * Determina o tipo de transação baseado no pagamento
   */
  private static getTransactionTypeFromPayment(payment: Payment): TransactionType {
    switch (payment.status) {
      case PaymentStatus.CAPTURED:
      case PaymentStatus.AUTHORIZED:
        return TransactionType.PAYMENT;
      case PaymentStatus.REFUNDED:
      case PaymentStatus.PARTIALLY_REFUNDED:
        return TransactionType.REFUND;
      default:
        return TransactionType.PAYMENT;
    }
  }

  /**
   * Valida se um pagamento pode ser capturado automaticamente
   */
  static shouldAutoCapture(
    payment: Payment,
    tenantSettings: TenantSettings
  ): boolean {
    // Verificar configuração do tenant
    const autoCaptureEnabled = tenantSettings.apiKeys?.autoCaptureEnabled === 'true';
    
    if (!autoCaptureEnabled) {
      return false;
    }

    // Verificar se o pagamento está autorizado
    if (!payment.isAuthorized) {
      return false;
    }

    // Verificar se não expirou
    if (payment.isExpired) {
      return false;
    }

    // Verificar se não foi cancelado
    if (payment.isCancelled) {
      return false;
    }

    return true;
  }

  /**
   * Calcula a data de expiração baseada no provider e configurações
   */
  static calculateExpirationDate(
    provider: PaymentProvider,
    tenantSettings: TenantSettings
  ): Date {
    let expirationDays: number;

    switch (provider) {
      case PaymentProvider.STRIPE:
        expirationDays = 7; // 7 dias para Stripe
        break;
      case PaymentProvider.PAGARME:
        expirationDays = 3; // 3 dias para Pagar.me
        break;
      // case PaymentProvider.MERCADOPAGO:
      //   expirationDays = 10; // 10 dias para Mercado Pago
      //   break;
      default:
        expirationDays = 5; // 5 dias padrão
    }

    // Verificar se há configuração customizada do tenant
    const customExpiration = tenantSettings.apiKeys?.paymentExpirationDays;
    if (customExpiration) {
      expirationDays = parseInt(customExpiration);
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    
    return expirationDate;
  }
}
