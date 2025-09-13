import { ValueObject } from '../value-objects/ValueObject';

// Value Objects para Tenant
export class TenantId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('TenantId deve ser uma string válida');
    }
    if (this.value.length < 3) {
      throw new Error('TenantId deve ter pelo menos 3 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class TenantSlug extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('TenantSlug deve ser uma string válida');
    }
    if (!/^[a-z0-9-]+$/.test(this.value)) {
      throw new Error('TenantSlug deve conter apenas letras minúsculas, números e hífens');
    }
    if (this.value.length < 3 || this.value.length > 50) {
      throw new Error('TenantSlug deve ter entre 3 e 50 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class TenantEmail extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('TenantEmail deve ser uma string válida');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('TenantEmail deve ter um formato válido');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Entidade Tenant
export class Tenant {
  private constructor(
    private readonly _id: TenantId,
    private _name: string,
    private _slug: TenantSlug,
    private _email: TenantEmail,
    private _status: TenantStatus,
    private _settings: TenantSettings,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt?: Date
  ) {}

  // Factory method para criar novo tenant
  static create(
    id: string,
    name: string,
    slug: string,
    email: string,
    settings: TenantSettings
  ): Tenant {
    const now = new Date();
    return new Tenant(
      new TenantId(id),
      name,
      new TenantSlug(slug),
      new TenantEmail(email),
      TenantStatus.ACTIVE,
      settings,
      now,
      now
    );
  }

  // Factory method para reconstruir do banco
  static fromPersistence(
    id: string,
    name: string,
    slug: string,
    email: string,
    status: string,
    settings: any,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ): Tenant {
    return new Tenant(
      new TenantId(id),
      name,
      new TenantSlug(slug),
      new TenantEmail(email),
      status as TenantStatus,
      TenantSettings.fromPersistence(settings),
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  // Getters
  get id(): TenantId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): TenantSlug {
    return this._slug;
  }

  get email(): TenantEmail {
    return this._email;
  }

  get status(): TenantStatus {
    return this._status;
  }

  get settings(): TenantSettings {
    return this._settings;
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
    return this._status === TenantStatus.ACTIVE && !this._deletedAt;
  }

  // Métodos de negócio
  activate(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível ativar um tenant deletado');
    }
    this._status = TenantStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível desativar um tenant deletado');
    }
    this._status = TenantStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  suspend(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível suspender um tenant deletado');
    }
    this._status = TenantStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  updateSettings(newSettings: TenantSettings): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar configurações de um tenant inativo');
    }
    this._settings = newSettings;
    this._updatedAt = new Date();
  }

  updateBasicInfo(name: string, email: string): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar informações de um tenant inativo');
    }
    this._name = name;
    this._email = new TenantEmail(email);
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // Método para serialização
  toPersistence(): any {
    return {
      id: this._id.getValue(),
      name: this._name,
      slug: this._slug.getValue(),
      email: this._email.getValue(),
      status: this._status,
      settings: this._settings.toPersistence(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt
    };
  }
}

// Value Object para configurações do tenant
export class TenantSettings extends ValueObject<object> {
  private constructor(
    public readonly timezone: string,
    public readonly currency: string,
    public readonly language: string,
    public readonly paymentMethods: string[],
    public readonly webhookUrl?: string,
    public readonly apiKeys?: Record<string, string>
  ) {
    super({
      timezone,
      currency,
      language,
      paymentMethods,
      webhookUrl,
      apiKeys
    });
    this.validate();
  }

  static create(
    timezone: string,
    currency: string,
    language: string,
    paymentMethods: string[],
    webhookUrl?: string,
    apiKeys?: Record<string, string>
  ): TenantSettings {
    return new TenantSettings(
      timezone,
      currency,
      language,
      paymentMethods,
      webhookUrl,
      apiKeys
    );
  }

  static fromPersistence(data: any): TenantSettings {
    return new TenantSettings(
      data.timezone || 'America/Sao_Paulo',
      data.currency || 'BRL',
      data.language || 'pt-BR',
      data.paymentMethods || [],
      data.webhookUrl,
      data.apiKeys
    );
  }

  private validate(): void {
    if (!this.timezone || typeof this.timezone !== 'string') {
      throw new Error('Timezone é obrigatório');
    }
    if (!this.currency || typeof this.currency !== 'string') {
      throw new Error('Moeda é obrigatória');
    }
    if (!this.language || typeof this.language !== 'string') {
      throw new Error('Idioma é obrigatório');
    }
    if (!Array.isArray(this.paymentMethods)) {
      throw new Error('Métodos de pagamento devem ser um array');
    }
    if (this.webhookUrl && typeof this.webhookUrl !== 'string') {
      throw new Error('URL do webhook deve ser uma string válida');
    }
    if (this.webhookUrl) {
      try {
        new URL(this.webhookUrl);
      } catch {
        throw new Error('URL do webhook deve ter um formato válido');
      }
    }
    if (this.apiKeys && typeof this.apiKeys !== 'object') {
      throw new Error('API Keys devem ser um objeto');
    }
  }

  toPersistence(): any {
    return {
      timezone: this.timezone,
      currency: this.currency,
      language: this.language,
      paymentMethods: this.paymentMethods,
      webhookUrl: this.webhookUrl,
      apiKeys: this.apiKeys
    };
  }
}
