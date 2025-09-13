import { describe, test, expect, beforeEach } from 'bun:test';
import { Payment } from '../../../src/domain/entities/Payment';
// PaymentId import removido - não utilizado
import { Money } from '../../../src/domain/value-objects/Money';
import { Currency } from '../../../src/domain/value-objects/Currency';
import { PaymentStatus } from '../../../src/domain/enums/PaymentStatus';
import { PaymentProvider } from '../../../src/domain/enums/PaymentProvider';
import { PaymentDescription } from '../../../src/domain/value-objects/PaymentDescription';

describe('Payment Entity', () => {
  let payment: Payment;

  beforeEach(() => {
    payment = Payment.create(
      'payment-123',
      'tenant-123',
      'user-123',
      50.00, // R$ 50,00
      'BRL',
      PaymentProvider.STRIPE,
      'pi_stripe_123',
      'Pagamento de teste',
      { orderId: 'order-123' },
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    );
  });

  describe('Creation', () => {
    test('should create a new payment with valid data', () => {
      expect(payment.id.getValue()).toBe('payment-123');
      expect(payment.tenantId.getValue()).toBe('tenant-123');
      expect(payment.userId?.getValue()).toBe('user-123');
      expect(payment.amount.toReais()).toBe(50.00);
      expect(payment.currency.getValue()).toBe('BRL');
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.provider).toBe(PaymentProvider.STRIPE);
      expect(payment.description.getValue()).toBe('Pagamento de teste');
    });

    test('should create payment without user', () => {
      const paymentWithoutUser = Payment.create(
        'payment-456',
        'tenant-123',
        null,
        25.00,
        'BRL',
        PaymentProvider.PAGARME,
        'pi_pagarme_456',
        'Pagamento sem usuário'
      );

      expect(paymentWithoutUser.userId).toBeNull();
      expect(paymentWithoutUser.amount.toReais()).toBe(25.00);
    });

    test('should set created and updated dates', () => {
      expect(payment.createdAt).toBeInstanceOf(Date);
      expect(payment.updatedAt).toBeInstanceOf(Date);
      expect(payment.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(payment.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Value Objects', () => {
    test('should create Money from reais', () => {
      const money = Money.fromReais(25.50);
      expect(money.getValue()).toBe(2550); // centavos
      expect(money.toReais()).toBe(25.50);
    });

    test('should format Money correctly', () => {
      const money = Money.fromReais(1234.56);
      const formatted = money.format('BRL');
      expect(formatted).toContain('R$');
      expect(formatted).toContain('1.234');
      expect(formatted).toContain('56');
    });

    test('should perform Money arithmetic', () => {
      const money1 = Money.fromReais(10.00);
      const money2 = Money.fromReais(5.50);
      
      const sum = money1.add(money2);
      expect(sum.toReais()).toBe(15.50);
      
      const diff = money1.subtract(money2);
      expect(diff.toReais()).toBe(4.50);
      
      const multiplied = money1.multiply(2);
      expect(multiplied.toReais()).toBe(20.00);
    });

    test('should throw error for negative Money', () => {
      expect(() => new Money(-100)).toThrow('Money não pode ser negativo');
    });

    test('should throw error for non-integer Money', () => {
      expect(() => new Money(10.5)).toThrow('Money deve ser um número inteiro (centavos)');
    });

    test('should create Currency with valid values', () => {
      const brl = new Currency('BRL');
      const usd = new Currency('USD');
      const eur = new Currency('EUR');
      
      expect(brl.getValue()).toBe('BRL');
      expect(usd.getValue()).toBe('USD');
      expect(eur.getValue()).toBe('EUR');
    });

    test('should throw error for invalid Currency', () => {
      expect(() => new Currency('INVALID')).toThrow('Currency deve ser uma das seguintes: BRL, USD, EUR');
    });

    test('should create PaymentDescription with valid text', () => {
      const desc = new PaymentDescription('Valid description');
      expect(desc.getValue()).toBe('Valid description');
    });

    test('should throw error for invalid PaymentDescription', () => {
      expect(() => new PaymentDescription('ab')).toThrow('PaymentDescription deve ter pelo menos 3 caracteres');
      expect(() => new PaymentDescription('a'.repeat(256))).toThrow('PaymentDescription não pode ter mais de 255 caracteres');
    });
  });

  describe('Business Logic', () => {
    test('should authorize payment', () => {
      payment.authorize();
      expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
      expect(payment.isAuthorized).toBe(true);
    });

    test('should not authorize non-pending payment', () => {
      payment.authorize();
      expect(() => payment.authorize()).toThrow('Apenas pagamentos pendentes podem ser autorizados');
    });

    test('should capture authorized payment', () => {
      payment.authorize();
      payment.capture();
      
      expect(payment.status).toBe(PaymentStatus.CAPTURED);
      expect(payment.isCaptured).toBe(true);
      expect(payment.paidAt).toBeInstanceOf(Date);
    });

    test('should not capture non-authorized payment', () => {
      expect(() => payment.capture()).toThrow('Apenas pagamentos autorizados podem ser capturados');
    });

    test('should fail payment', () => {
      payment.fail('Insufficient funds');
      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(payment.isFailed).toBe(true);
      expect(payment.metadata.failureReason).toBe('Insufficient funds');
    });

    test('should cancel pending payment', () => {
      payment.cancel('User requested cancellation');
      expect(payment.status).toBe(PaymentStatus.CANCELLED);
      expect(payment.isCancelled).toBe(true);
      expect(payment.metadata.cancellationReason).toBe('User requested cancellation');
    });

    test('should cancel authorized payment', () => {
      payment.authorize();
      payment.cancel('User requested cancellation');
      expect(payment.status).toBe(PaymentStatus.CANCELLED);
    });

    test('should not cancel captured payment', () => {
      payment.authorize();
      payment.capture();
      expect(() => payment.cancel('test')).toThrow('Apenas pagamentos pendentes ou autorizados podem ser cancelados');
    });

    test('should refund captured payment', () => {
      payment.authorize();
      payment.capture();
      payment.refund(25.00, 'Partial refund');
      
      expect(payment.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
      expect(payment.metadata.refundReason).toBe('Partial refund');
    });

    test('should fully refund captured payment', () => {
      payment.authorize();
      payment.capture();
      payment.refund(); // full refund
      
      expect(payment.status).toBe(PaymentStatus.REFUNDED);
    });

    test('should not refund non-captured payment', () => {
      expect(() => payment.refund(25.00)).toThrow('Apenas pagamentos capturados podem ser reembolsados');
    });

    test('should not refund more than payment amount', () => {
      payment.authorize();
      payment.capture();
      
      expect(() => payment.refund(100.00)).toThrow('Valor do reembolso não pode ser maior que o valor do pagamento');
    });

    test('should update provider data', () => {
      const newData = { stripe_intent_id: 'pi_new_123' };
      payment.updateProviderData(newData);
      
      expect(payment.providerData.stripe_intent_id).toBe('pi_new_123');
    });

    test('should update metadata', () => {
      const newMetadata = { orderId: 'order-456' };
      payment.updateMetadata(newMetadata);
      
      expect(payment.metadata.orderId).toBe('order-456');
    });

    test('should extend expiration for pending payment', () => {
      const newExpiration = new Date(Date.now() + 48 * 60 * 60 * 1000);
      payment.extendExpiration(newExpiration);
      
      expect(payment.expiresAt).toEqual(newExpiration);
    });

    test('should not extend expiration for non-pending payment', () => {
      payment.authorize();
      const newExpiration = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      expect(() => payment.extendExpiration(newExpiration)).toThrow('Apenas pagamentos pendentes podem ter expiração estendida');
    });

    test('should soft delete non-captured payment', () => {
      payment.softDelete();
      expect(payment.deletedAt).toBeInstanceOf(Date);
      expect(payment.isActive).toBe(false);
    });

    test('should not soft delete captured payment', () => {
      payment.authorize();
      payment.capture();
      
      expect(() => payment.softDelete()).toThrow('Não é possível deletar um pagamento capturado');
    });
  });

  describe('Status Checks', () => {
    test('should correctly identify payment statuses', () => {
      expect(payment.isPending).toBe(true);
      expect(payment.isAuthorized).toBe(false);
      expect(payment.isCaptured).toBe(false);
      expect(payment.isFailed).toBe(false);
      expect(payment.isCancelled).toBe(false);
      expect(payment.isRefunded).toBe(false);

      payment.authorize();
      expect(payment.isPending).toBe(false);
      expect(payment.isAuthorized).toBe(true);
      expect(payment.canBeCaptured).toBe(true);

      payment.capture();
      expect(payment.isAuthorized).toBe(false);
      expect(payment.isCaptured).toBe(true);
      expect(payment.canBeRefunded).toBe(true);
    });

    test('should check if payment is expired', () => {
      // Create payment with past expiration
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

      expect(expiredPayment.isExpired).toBe(true);
      expect(payment.isExpired).toBe(false);
    });

    test('should check cancellation eligibility', () => {
      expect(payment.canBeCancelled).toBe(true);
      
      payment.authorize();
      expect(payment.canBeCancelled).toBe(true);
      
      payment.capture();
      expect(payment.canBeCancelled).toBe(false);
    });
  });

  describe('Persistence', () => {
    test('should serialize to persistence format', () => {
      const persistence = payment.toPersistence();
      
      expect(persistence.id).toBe('payment-123');
      expect(persistence.tenantId).toBe('tenant-123');
      expect(persistence.userId).toBe('user-123');
      expect(persistence.amount).toBe(5000); // centavos
      expect(persistence.currency).toBe('BRL');
      expect(persistence.status).toBe(PaymentStatus.PENDING);
      expect(persistence.provider).toBe(PaymentProvider.STRIPE);
      expect(persistence.description).toBe('Pagamento de teste');
      expect(persistence.metadata).toEqual({ orderId: 'order-123' });
      expect(persistence.expiresAt).toBeInstanceOf(Date);
    });

    test('should create from persistence data', () => {
      const persistence = payment.toPersistence();
      const recreated = Payment.fromPersistence(
        persistence.id,
        persistence.tenantId,
        persistence.userId,
        persistence.amount,
        persistence.currency,
        persistence.status,
        persistence.provider,
        persistence.providerPaymentId,
        persistence.providerData,
        persistence.description,
        persistence.metadata,
        persistence.paidAt,
        persistence.expiresAt,
        persistence.createdAt,
        persistence.updatedAt,
        persistence.deletedAt
      );

      expect(recreated.id.getValue()).toBe(payment.id.getValue());
      expect(recreated.amount.getValue()).toBe(payment.amount.getValue());
      expect(recreated.status).toBe(payment.status);
    });
  });
});
