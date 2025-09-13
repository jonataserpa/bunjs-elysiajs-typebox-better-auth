import { ValueObject } from '../value-objects/ValueObject';
import { TenantId } from './Tenant';
import { PaymentId } from '../value-objects/PaymentId';
import { Money } from '../value-objects/Money';
// Currency import removido - não utilizado

// Value Objects para Transaction
export class TransactionId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('TransactionId deve ser uma string válida');
    }
    if (this.value.length < 3) {
      throw new Error('TransactionId deve ter pelo menos 3 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  ADJUSTMENT = 'adjustment',
  FEE = 'fee'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export class ProviderTransactionId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('ProviderTransactionId deve ser uma string válida');
    }
    if (this.value.length < 3) {
      throw new Error('ProviderTransactionId deve ter pelo menos 3 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

// Entidade Transaction
export class Transaction {
  private constructor(
    private readonly _id: TransactionId,
    private readonly _paymentId: PaymentId,
    private readonly _tenantId: TenantId,
    private _type: TransactionType,
    private _amount: Money,
    private _status: TransactionStatus,
    private _providerTransactionId: ProviderTransactionId,
    private _providerData: Record<string, any>,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _processedAt?: Date,
    private _deletedAt?: Date
  ) {}

  // Factory method para criar nova transação
  static create(
    id: string,
    paymentId: string,
    tenantId: string,
    type: TransactionType,
    amount: number,
    providerTransactionId: string,
    providerData?: Record<string, any>
  ): Transaction {
    const now = new Date();
    return new Transaction(
      new TransactionId(id),
      new PaymentId(paymentId),
      new TenantId(tenantId),
      type,
      Money.fromReais(amount),
      TransactionStatus.PENDING,
      new ProviderTransactionId(providerTransactionId),
      providerData || {},
      now,
      now,
      undefined,
      undefined
    );
  }

  // Factory method para reconstruir do banco
  static fromPersistence(
    id: string,
    paymentId: string,
    tenantId: string,
    type: string,
    amount: number,
    status: string,
    providerTransactionId: string,
    providerData: any,
    createdAt: Date,
    updatedAt: Date,
    processedAt?: Date,
    deletedAt?: Date
  ): Transaction {
    return new Transaction(
      new TransactionId(id),
      new PaymentId(paymentId),
      new TenantId(tenantId),
      type as TransactionType,
      new Money(amount),
      status as TransactionStatus,
      new ProviderTransactionId(providerTransactionId),
      providerData || {},
      createdAt,
      updatedAt,
      processedAt,
      deletedAt
    );
  }

  // Getters
  get id(): TransactionId {
    return this._id;
  }

  get paymentId(): PaymentId {
    return this._paymentId;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get type(): TransactionType {
    return this._type;
  }

  get amount(): Money {
    return this._amount;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get providerTransactionId(): ProviderTransactionId {
    return this._providerTransactionId;
  }

  get providerData(): Record<string, any> {
    return this._providerData;
  }

  get processedAt(): Date | undefined {
    return this._processedAt;
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
    return this._status === TransactionStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this._status === TransactionStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this._status === TransactionStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this._status === TransactionStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this._status === TransactionStatus.CANCELLED;
  }

  get isProcessed(): boolean {
    return this._processedAt !== undefined;
  }

  get canBeProcessed(): boolean {
    return this._status === TransactionStatus.PENDING && !this._deletedAt;
  }

  get canBeCancelled(): boolean {
    return [TransactionStatus.PENDING, TransactionStatus.PROCESSING].includes(this._status) && !this._deletedAt;
  }

  get canBeRetried(): boolean {
    return this._status === TransactionStatus.FAILED && !this._deletedAt;
  }

  // Métodos de negócio
  startProcessing(): void {
    if (!this.canBeProcessed) {
      throw new Error('Apenas transações pendentes podem ser processadas');
    }
    this._status = TransactionStatus.PROCESSING;
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status !== TransactionStatus.PROCESSING) {
      throw new Error('Apenas transações em processamento podem ser completadas');
    }
    this._status = TransactionStatus.COMPLETED;
    this._processedAt = new Date();
    this._updatedAt = new Date();
  }

  fail(reason?: string): void {
    if (this._deletedAt) {
      throw new Error('Não é possível falhar uma transação deletada');
    }
    this._status = TransactionStatus.FAILED;
    if (reason) {
      this._providerData = { ...this._providerData, failureReason: reason };
    }
    this._updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled) {
      throw new Error('Apenas transações pendentes ou em processamento podem ser canceladas');
    }
    this._status = TransactionStatus.CANCELLED;
    if (reason) {
      this._providerData = { ...this._providerData, cancellationReason: reason };
    }
    this._updatedAt = new Date();
  }

  retry(): void {
    if (!this.canBeRetried) {
      throw new Error('Apenas transações falhadas podem ser tentadas novamente');
    }
    this._status = TransactionStatus.PENDING;
    this._updatedAt = new Date();
  }

  updateProviderData(newData: Record<string, any>): void {
    if (this._deletedAt) {
      throw new Error('Não é possível atualizar dados do provider de uma transação deletada');
    }
    this._providerData = { ...this._providerData, ...newData };
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this.isCompleted) {
      throw new Error('Não é possível deletar uma transação completada');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // Método para serialização
  toPersistence(): any {
    return {
      id: this._id.getValue(),
      paymentId: this._paymentId.getValue(),
      tenantId: this._tenantId.getValue(),
      type: this._type,
      amount: this._amount.getValue(),
      status: this._status,
      providerTransactionId: this._providerTransactionId.getValue(),
      providerData: this._providerData,
      processedAt: this._processedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt
    };
  }
}
