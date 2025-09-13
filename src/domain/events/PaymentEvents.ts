import { DomainEvent } from './DomainEvent';

/**
 * Evento disparado quando um pagamento é criado
 */
export class PaymentCreatedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly userId: string | null,
    public readonly amount: number,
    public readonly currency: string,
    public readonly provider: string,
    public readonly description: string
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.created';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      provider: this.provider,
      description: this.description
    };
  }
}

/**
 * Evento disparado quando um pagamento é autorizado
 */
export class PaymentAuthorizedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerPaymentId: string,
    public readonly authorizedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.authorized';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerPaymentId: this.providerPaymentId,
      authorizedAt: this.authorizedAt.toISOString()
    };
  }
}

/**
 * Evento disparado quando um pagamento é capturado
 */
export class PaymentCapturedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly providerPaymentId: string,
    public readonly capturedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.captured';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      amount: this.amount,
      currency: this.currency,
      providerPaymentId: this.providerPaymentId,
      capturedAt: this.capturedAt.toISOString()
    };
  }
}

/**
 * Evento disparado quando um pagamento falha
 */
export class PaymentFailedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerPaymentId: string,
    public readonly failureReason: string,
    public readonly failedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.failed';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerPaymentId: this.providerPaymentId,
      failureReason: this.failureReason,
      failedAt: this.failedAt.toISOString()
    };
  }
}

/**
 * Evento disparado quando um pagamento é cancelado
 */
export class PaymentCancelledEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerPaymentId: string,
    public readonly cancellationReason: string,
    public readonly cancelledAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.cancelled';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerPaymentId: this.providerPaymentId,
      cancellationReason: this.cancellationReason,
      cancelledAt: this.cancelledAt.toISOString()
    };
  }
}

/**
 * Evento disparado quando um pagamento é reembolsado
 */
export class PaymentRefundedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly refundAmount: number,
    public readonly refundReason: string,
    public readonly refundedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.refunded';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      amount: this.amount,
      currency: this.currency,
      refundAmount: this.refundAmount,
      refundReason: this.refundReason,
      refundedAt: this.refundedAt.toISOString()
    };
  }
}

/**
 * Evento disparado quando um pagamento expira
 */
export class PaymentExpiredEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerPaymentId: string,
    public readonly expiredAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'payment.expired';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerPaymentId: this.providerPaymentId,
      expiredAt: this.expiredAt.toISOString()
    };
  }
}
