import { describe, test, expect, beforeEach } from 'bun:test';
import { PaymentDomainService } from '../../../src/domain/services/PaymentDomainService';
import { Payment } from '../../../src/domain/entities/Payment';
import { PaymentProvider } from '../../../src/domain/enums/PaymentProvider';
import { PaymentStatus } from '../../../src/domain/enums/PaymentStatus';
import { TenantSettings } from '../../../src/domain/entities/Tenant';
import { Money } from '../../../src/domain/value-objects/Money';

describe('PaymentDomainService', () => {
  let payment: Payment;
  let tenantSettings: TenantSettings;

  beforeEach(() => {
    payment = Payment.create(
      'payment-123',
      'tenant-123',
      'user-123',
      50.00, // R$ 50,00
      'BRL',
      PaymentProvider.STRIPE,
      'pi_stripe_123',
      'Pagamento de teste'
    );

    tenantSettings = TenantSettings.create(
      'America/Sao_Paulo',
      'BRL',
      'pt-BR',
      ['stripe', 'pagarme'],
      'https://example.com/webhook',
      {
        maxPaymentAmount: '100000', // R$ 1000,00
        autoCaptureEnabled: 'true'
      }
    );
  });

  describe('canProcessPayment', () => {
    test('should allow processing valid payment', () => {
      const result = PaymentDomainService.canProcessPayment(payment, tenantSettings);
      expect(result.canProcess).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('should not process failed payment', () => {
      payment.fail('Test failure');
      const result = PaymentDomainService.canProcessPayment(payment, tenantSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toBe('Pagamento já falhou');
    });

    test('should not process cancelled payment', () => {
      payment.cancel('Test cancellation');
      const result = PaymentDomainService.canProcessPayment(payment, tenantSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toBe('Pagamento foi cancelado');
    });

    test('should not process refunded payment', () => {
      payment.authorize();
      payment.capture();
      payment.refund();
      const result = PaymentDomainService.canProcessPayment(payment, tenantSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toBe('Pagamento foi reembolsado');
    });

    test('should not process expired payment', () => {
      // Create expired payment
      const expiredPayment = Payment.create(
        'payment-expired',
        'tenant-123',
        null,
        10.00,
        'BRL',
        PaymentProvider.STRIPE,
        'pi_expired',
        'Expired payment',
        {},
        new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      );

      const result = PaymentDomainService.canProcessPayment(expiredPayment, tenantSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toBe('Pagamento expirado');
    });

    test('should not process payment exceeding max amount', () => {
      const highValuePayment = Payment.create(
        'payment-high',
        'tenant-123',
        null,
        1500.00, // R$ 1500,00 (exceeds R$ 1000,00 limit)
        'BRL',
        PaymentProvider.STRIPE,
        'pi_high',
        'High value payment'
      );

      const result = PaymentDomainService.canProcessPayment(highValuePayment, tenantSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toContain('Valor excede o limite máximo');
    });

    test('should not process payment with disallowed provider', () => {
      // Criar configurações que só permitem stripe
      const restrictedSettings = TenantSettings.create(
        'America/Sao_Paulo',
        'BRL',
        'pt-BR',
        ['stripe'], // Apenas stripe permitido
        'https://example.com/webhook',
        {
          maxPaymentAmount: '100000',
          autoCaptureEnabled: 'true'
        }
      );

      const pagarmePayment = Payment.create(
        'payment-pagarme',
        'tenant-123',
        null,
        10.00,
        'BRL',
        PaymentProvider.PAGARME, // Pagar.me não está na lista permitida
        'pi_pagarme',
        'Pagar.me payment',
        {}
      );

      const result = PaymentDomainService.canProcessPayment(pagarmePayment, restrictedSettings);
      expect(result.canProcess).toBe(false);
      expect(result.reason).toContain('Provider pagarme não é permitido para este tenant');
    });
  });

  describe('calculateProviderFee', () => {
    test('should calculate Stripe fee for card payment', () => {
      const amount = Money.fromReais(100.00);
      const fee = PaymentDomainService.calculateProviderFee(amount, PaymentProvider.STRIPE, 'card');
      
      // 3.49% of R$ 100.00 = R$ 3.49
      expect(fee.toReais()).toBeCloseTo(3.49, 2);
    });

    test('should calculate Stripe fee for bank transfer', () => {
      const amount = Money.fromReais(100.00);
      const fee = PaymentDomainService.calculateProviderFee(amount, PaymentProvider.STRIPE, 'bank_transfer');
      
      // 1.49% of R$ 100.00 = R$ 1.49
      expect(fee.toReais()).toBeCloseTo(1.49, 2);
    });

    test('should calculate Pagar.me fee for card payment', () => {
      const amount = Money.fromReais(100.00);
      const fee = PaymentDomainService.calculateProviderFee(amount, PaymentProvider.PAGARME, 'card');
      
      // 3.99% of R$ 100.00 = R$ 3.99
      expect(fee.toReais()).toBeCloseTo(3.99, 2);
    });

    test('should apply minimum fee', () => {
      const amount = Money.fromReais(1.00); // R$ 1.00
      const fee = PaymentDomainService.calculateProviderFee(amount, PaymentProvider.STRIPE, 'card');
      
      // Should be minimum fee of R$ 0.50, not 3.49% of R$ 1.00
      expect(fee.toReais()).toBe(0.50);
    });

    test('should calculate default fee for unknown provider', () => {
      const amount = Money.fromReais(100.00);
      const fee = PaymentDomainService.calculateProviderFee(amount, 'unknown' as PaymentProvider, 'card');
      
      // Default 3.99% of R$ 100.00 = R$ 3.99
      expect(fee.toReais()).toBeCloseTo(3.99, 2);
    });
  });

  describe('calculateNetAmount', () => {
    test('should calculate net amount after fees', () => {
      const amount = Money.fromReais(100.00);
      const netAmount = PaymentDomainService.calculateNetAmount(amount, PaymentProvider.STRIPE, 'card');
      
      // R$ 100.00 - R$ 3.49 = R$ 96.51
      expect(netAmount.toReais()).toBeCloseTo(96.51, 2);
    });

    test('should handle minimum fee scenario', () => {
      const amount = Money.fromReais(1.00);
      const netAmount = PaymentDomainService.calculateNetAmount(amount, PaymentProvider.STRIPE, 'card');
      
      // R$ 1.00 - R$ 0.50 = R$ 0.50
      expect(netAmount.toReais()).toBe(0.50);
    });
  });

  describe('canProcessRefund', () => {
    test('should allow refund for captured payment', () => {
      payment.authorize();
      payment.capture();
      
      const result = PaymentDomainService.canProcessRefund(payment);
      expect(result.canRefund).toBe(true);
      expect(result.maxRefundAmount).toBe(50.00);
    });

    test('should not allow refund for non-captured payment', () => {
      const result = PaymentDomainService.canProcessRefund(payment);
      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Pagamento não pode ser reembolsado');
    });

    test('should not allow refund for already fully refunded payment', () => {
      payment.authorize();
      payment.capture();
      payment.refund(); // full refund
      
      const result = PaymentDomainService.canProcessRefund(payment);
      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Pagamento já foi totalmente reembolsado');
    });

    test('should validate refund amount', () => {
      payment.authorize();
      payment.capture();
      
      const result = PaymentDomainService.canProcessRefund(payment, 60.00); // more than payment amount
      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Valor do reembolso excede o valor do pagamento');
    });

    test('should validate positive refund amount', () => {
      payment.authorize();
      payment.capture();
      
      const result = PaymentDomainService.canProcessRefund(payment, 0);
      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe('Valor do reembolso deve ser maior que zero');
    });
  });

  describe('determineNextPaymentStatus', () => {
    test('should determine status for pending payment', () => {
      const providerResponse = { status: 'succeeded' };
      const nextStatus = PaymentDomainService.determineNextPaymentStatus(
        PaymentStatus.PENDING,
        providerResponse
      );
      
      expect(nextStatus).toBe(PaymentStatus.CAPTURED);
    });

    test('should determine authorized status for requires_action', () => {
      const providerResponse = { status: 'requires_action' };
      const nextStatus = PaymentDomainService.determineNextPaymentStatus(
        PaymentStatus.PENDING,
        providerResponse
      );
      
      expect(nextStatus).toBe(PaymentStatus.AUTHORIZED);
    });

    test('should determine failed status', () => {
      const providerResponse = { status: 'failed' };
      const nextStatus = PaymentDomainService.determineNextPaymentStatus(
        PaymentStatus.PENDING,
        providerResponse
      );
      
      expect(nextStatus).toBe(PaymentStatus.FAILED);
    });

    test('should maintain current status for unknown response', () => {
      const providerResponse = { status: 'unknown' };
      const nextStatus = PaymentDomainService.determineNextPaymentStatus(
        PaymentStatus.PENDING,
        providerResponse
      );
      
      expect(nextStatus).toBe(PaymentStatus.PENDING);
    });
  });

  describe('shouldAutoCapture', () => {
    test('should auto capture when enabled and payment is authorized', () => {
      payment.authorize();
      
      const shouldCapture = PaymentDomainService.shouldAutoCapture(payment, tenantSettings);
      expect(shouldCapture).toBe(true);
    });

    test('should not auto capture when disabled', () => {
      const disabledSettings = TenantSettings.create(
        'America/Sao_Paulo',
        'BRL',
        'pt-BR',
        ['stripe'],
        undefined,
        { autoCaptureEnabled: 'false' }
      );
      
      payment.authorize();
      const shouldCapture = PaymentDomainService.shouldAutoCapture(payment, disabledSettings);
      expect(shouldCapture).toBe(false);
    });

    test('should not auto capture non-authorized payment', () => {
      const shouldCapture = PaymentDomainService.shouldAutoCapture(payment, tenantSettings);
      expect(shouldCapture).toBe(false);
    });

    test('should not auto capture expired payment', () => {
      const expiredPayment = Payment.create(
        'payment-expired',
        'tenant-123',
        null,
        10.00,
        'BRL',
        PaymentProvider.STRIPE,
        'pi_expired',
        'Expired payment',
        {},
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      expiredPayment.authorize();
      const shouldCapture = PaymentDomainService.shouldAutoCapture(expiredPayment, tenantSettings);
      expect(shouldCapture).toBe(false);
    });

    test('should not auto capture cancelled payment', () => {
      payment.authorize();
      payment.cancel('Test cancellation');
      
      const shouldCapture = PaymentDomainService.shouldAutoCapture(payment, tenantSettings);
      expect(shouldCapture).toBe(false);
    });
  });

  describe('calculateExpirationDate', () => {
    test('should calculate expiration for Stripe', () => {
      const expiration = PaymentDomainService.calculateExpirationDate(
        PaymentProvider.STRIPE,
        tenantSettings
      );
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 7); // 7 days
      
      expect(expiration.getTime()).toBeCloseTo(expectedDate.getTime(), -5); // within 5 seconds
    });

    test('should calculate expiration for Pagar.me', () => {
      const expiration = PaymentDomainService.calculateExpirationDate(
        PaymentProvider.PAGARME,
        tenantSettings
      );
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3); // 3 days
      
      expect(expiration.getTime()).toBeCloseTo(expectedDate.getTime(), -5);
    });

    test('should use custom expiration from tenant settings', () => {
      const customSettings = TenantSettings.create(
        'America/Sao_Paulo',
        'BRL',
        'pt-BR',
        ['stripe'],
        undefined,
        { paymentExpirationDays: '14' }
      );
      
      const expiration = PaymentDomainService.calculateExpirationDate(
        PaymentProvider.STRIPE,
        customSettings
      );
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 14); // 14 days
      
      expect(expiration.getTime()).toBeCloseTo(expectedDate.getTime(), -5);
    });
  });
});
