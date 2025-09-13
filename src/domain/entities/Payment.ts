import { PaymentId } from '../value-objects/PaymentId';
import { Money } from '../value-objects/Money';
import { Currency } from '../value-objects/Currency';
import { PaymentDescription } from '../value-objects/PaymentDescription';
import { PaymentStatus } from '../enums/PaymentStatus';
import { PaymentProvider } from '../enums/PaymentProvider';
import { TenantId } from './Tenant';
import { UserId } from './User';

// Entidade Payment
export class Payment {
  private constructor(
    private readonly _id: PaymentId,
    private readonly _tenantId: TenantId,
    private readonly _userId: UserId | null,
    private _amount: Money,
    private _currency: Currency,
    private _status: PaymentStatus,
    private _provider: PaymentProvider,
    private _providerPaymentId: string,
    private _providerData: Record<string, any>,
    private _description: PaymentDescription,
    private _metadata: Record<string, any>,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _paidAt?: Date,
    private _expiresAt?: Date,
    private _deletedAt?: Date
  ) {}

  // Factory method para criar novo pagamento
  static create(
    id: string,
    tenantId: string,
    userId: string | null,
    amount: number,
    currency: string,
    provider: PaymentProvider,
    providerPaymentId: string,
    description: string,
    metadata?: Record<string, any>,
    expiresAt?: Date
  ): Payment {
    const now = new Date();
    return new Payment(
      new PaymentId(id),
      new TenantId(tenantId),
      userId ? new UserId(userId) : null,
      Money.fromReais(amount),
      new Currency(currency),
      PaymentStatus.PENDING,
      provider,
      providerPaymentId,
      {},
      new PaymentDescription(description),
      metadata || {},
      now,
      now,
      undefined,
      expiresAt,
      undefined
    );
  }

  // Factory method para reconstruir do banco
  static fromPersistence(
    id: string,
    tenantId: string,
    userId: string | null,
    amount: number,
    currency: string,
    status: string,
    provider: string,
    providerPaymentId: string,
    providerData: any,
    description: string,
    metadata: any,
    createdAt: Date,
    updatedAt: Date,
    paidAt?: Date,
    expiresAt?: Date,
    deletedAt?: Date
  ): Payment {
    return new Payment(
      new PaymentId(id),
      new TenantId(tenantId),
      userId ? new UserId(userId) : null,
      new Money(amount),
      new Currency(currency),
      status as PaymentStatus,
      provider as PaymentProvider,
      providerPaymentId,
      providerData || {},
      new PaymentDescription(description),
      metadata || {},
      createdAt,
      updatedAt,
      paidAt,
      expiresAt,
      deletedAt
    );
  }

  // Getters
  get id(): PaymentId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get userId(): UserId | null {
    return this._userId;
  }

  get amount(): Money {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get provider(): PaymentProvider {
    return this._provider;
  }

  get providerPaymentId(): string {
    return this._providerPaymentId;
  }

  get providerData(): Record<string, any> {
    return this._providerData;
  }

  get description(): PaymentDescription {
    return this._description;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get expiresAt(): Date | undefined {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get isActive(): boolean {
    return !this._deletedAt;
  }

  get isPending(): boolean {
    return this._status === PaymentStatus.PENDING;
  }

  get isAuthorized(): boolean {
    return this._status === PaymentStatus.AUTHORIZED;
  }

  get isCaptured(): boolean {
    return this._status === PaymentStatus.CAPTURED;
  }

  get isFailed(): boolean {
    return this._status === PaymentStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this._status === PaymentStatus.CANCELLED;
  }

  get isRefunded(): boolean {
    return this._status === PaymentStatus.REFUNDED;
  }

  get isPartiallyRefunded(): boolean {
    return this._status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  get isExpired(): boolean {
    return this._expiresAt ? this._expiresAt < new Date() : false;
  }

  get canBeCaptured(): boolean {
    return this._status === PaymentStatus.AUTHORIZED && !this._deletedAt;
  }

  get canBeCancelled(): boolean {
    return [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED].includes(this._status) && !this._deletedAt;
  }

  get canBeRefunded(): boolean {
    return [PaymentStatus.CAPTURED, PaymentStatus.PARTIALLY_REFUNDED].includes(this._status) && !this._deletedAt;
  }

  // Métodos de negócio
  authorize(): void {
    if (!this.isPending) {
      throw new Error('Apenas pagamentos pendentes podem ser autorizados');
    }
    if (this._deletedAt) {
      throw new Error('Não é possível autorizar um pagamento deletado');
    }
    this._status = PaymentStatus.AUTHORIZED;
    this._updatedAt = new Date();
  }

  capture(): void {
    if (!this.canBeCaptured) {
      throw new Error('Apenas pagamentos autorizados podem ser capturados');
    }
    this._status = PaymentStatus.CAPTURED;
    this._paidAt = new Date();
    this._updatedAt = new Date();
  }

  fail(reason?: string): void {
    if (this._deletedAt) {
      throw new Error('Não é possível falhar um pagamento deletado');
    }
    this._status = PaymentStatus.FAILED;
    if (reason) {
      this._metadata = { ...this._metadata, failureReason: reason };
    }
    this._updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled) {
      throw new Error('Apenas pagamentos pendentes ou autorizados podem ser cancelados');
    }
    this._status = PaymentStatus.CANCELLED;
    if (reason) {
      this._metadata = { ...this._metadata, cancellationReason: reason };
    }
    this._updatedAt = new Date();
  }

  refund(amount?: number, reason?: string): void {
    if (!this.canBeRefunded) {
      throw new Error('Apenas pagamentos capturados podem ser reembolsados');
    }

    const refundAmount = amount ? Money.fromReais(amount) : this._amount;
    
    if (refundAmount.getValue() > this._amount.getValue()) {
      throw new Error('Valor do reembolso não pode ser maior que o valor do pagamento');
    }

    if (refundAmount.getValue() === this._amount.getValue()) {
      this._status = PaymentStatus.REFUNDED;
    } else {
      this._status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    if (reason) {
      this._metadata = { ...this._metadata, refundReason: reason };
    }

    this._updatedAt = new Date();
  }

  updateProviderData(newData: Record<string, any>): void {
    if (this._deletedAt) {
      throw new Error('Não é possível atualizar dados do provider de um pagamento deletado');
    }
    this._providerData = { ...this._providerData, ...newData };
    this._updatedAt = new Date();
  }

  updateMetadata(newMetadata: Record<string, any>): void {
    if (this._deletedAt) {
      throw new Error('Não é possível atualizar metadados de um pagamento deletado');
    }
    this._metadata = { ...this._metadata, ...newMetadata };
    this._updatedAt = new Date();
  }

  extendExpiration(newExpiresAt: Date): void {
    if (!this.isPending) {
      throw new Error('Apenas pagamentos pendentes podem ter expiração estendida');
    }
    if (this._deletedAt) {
      throw new Error('Não é possível estender expiração de um pagamento deletado');
    }
    this._expiresAt = newExpiresAt;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this.isCaptured) {
      throw new Error('Não é possível deletar um pagamento capturado');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // Método para serialização
  toPersistence(): any {
    return {
      id: this._id.getValue(),
      tenantId: this._tenantId.getValue(),
      userId: this._userId?.getValue() || null,
      amount: this._amount.getValue(),
      currency: this._currency.getValue(),
      status: this._status,
      provider: this._provider,
      providerPaymentId: this._providerPaymentId,
      providerData: this._providerData,
      description: this._description.getValue(),
      metadata: this._metadata,
      paidAt: this._paidAt,
      expiresAt: this._expiresAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt
    };
  }
}
