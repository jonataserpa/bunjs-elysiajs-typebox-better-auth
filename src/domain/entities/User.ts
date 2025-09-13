import { ValueObject } from '../value-objects/ValueObject';
import { TenantId } from './Tenant';

// Value Objects para User
export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('UserId deve ser uma string válida');
    }
    if (this.value.length < 3) {
      throw new Error('UserId deve ter pelo menos 3 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class UserEmail extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('UserEmail deve ser uma string válida');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('UserEmail deve ter um formato válido');
    }
    if (this.value.length > 255) {
      throw new Error('UserEmail não pode ter mais de 255 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class PasswordHash extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('PasswordHash deve ser uma string válida');
    }
    if (this.value.length < 10) {
      throw new Error('PasswordHash deve ter pelo menos 10 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export class UserName extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('UserName deve ser uma string válida');
    }
    if (this.value.trim().length < 2) {
      throw new Error('UserName deve ter pelo menos 2 caracteres');
    }
    if (this.value.length > 100) {
      throw new Error('UserName não pode ter mais de 100 caracteres');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export enum UserRole {
  ADMIN = 'admin',
  FINANCE = 'finance',
  CUSTOMER = 'customer',
  SUPPORT = 'support',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

// Entidade User
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _tenantId: TenantId,
    private _email: UserEmail,
    private _passwordHash: PasswordHash,
    private _firstName: UserName,
    private _lastName: UserName,
    private _role: UserRole,
    private _status: UserStatus,
    private _preferences: UserPreferences,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _emailVerifiedAt?: Date,
    private _lastLoginAt?: Date,
    private _deletedAt?: Date
  ) {}

  // Factory method para criar novo usuário
  static create(
    id: string,
    tenantId: string,
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    preferences?: UserPreferences
  ): User {
    const now = new Date();
    return new User(
      new UserId(id),
      new TenantId(tenantId),
      new UserEmail(email),
      new PasswordHash(passwordHash),
      new UserName(firstName),
      new UserName(lastName),
      role,
      UserStatus.ACTIVE,
      preferences || UserPreferences.createDefault(),
      now,
      now,
      undefined,
      undefined,
      undefined
    );
  }

  // Factory method para reconstruir do banco
  static fromPersistence(
    id: string,
    tenantId: string,
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: string,
    status: string,
    preferences: any,
    createdAt: Date,
    updatedAt: Date,
    emailVerifiedAt?: Date,
    lastLoginAt?: Date,
    deletedAt?: Date
  ): User {
    return new User(
      new UserId(id),
      new TenantId(tenantId),
      new UserEmail(email),
      new PasswordHash(passwordHash),
      new UserName(firstName),
      new UserName(lastName),
      role as UserRole,
      status as UserStatus,
      UserPreferences.fromPersistence(preferences),
      createdAt,
      updatedAt,
      emailVerifiedAt,
      lastLoginAt,
      deletedAt
    );
  }

  // Getters
  get id(): UserId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get email(): UserEmail {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get firstName(): UserName {
    return this._firstName;
  }

  get lastName(): UserName {
    return this._lastName;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get preferences(): UserPreferences {
    return this._preferences;
  }

  get emailVerifiedAt(): Date | undefined {
    return this._emailVerifiedAt;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
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

  get fullName(): string {
    return `${this._firstName.getValue()} ${this._lastName.getValue()}`;
  }

  get isActive(): boolean {
    return this._status === UserStatus.ACTIVE && !this._deletedAt;
  }

  get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== undefined;
  }

  get isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  get canManageUsers(): boolean {
    return [UserRole.ADMIN, UserRole.FINANCE].includes(this._role);
  }

  get canViewFinancialData(): boolean {
    return [UserRole.ADMIN, UserRole.FINANCE].includes(this._role);
  }

  // Métodos de negócio
  activate(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível ativar um usuário deletado');
    }
    this._status = UserStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível desativar um usuário deletado');
    }
    this._status = UserStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  suspend(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível suspender um usuário deletado');
    }
    this._status = UserStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  changeRole(newRole: UserRole): void {
    if (!this.isActive) {
      throw new Error('Não é possível alterar role de um usuário inativo');
    }
    this._role = newRole;
    this._updatedAt = new Date();
  }

  updatePassword(newPasswordHash: string): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar senha de um usuário inativo');
    }
    this._passwordHash = new PasswordHash(newPasswordHash);
    this._updatedAt = new Date();
  }

  updatePersonalInfo(firstName: string, lastName: string): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar informações de um usuário inativo');
    }
    this._firstName = new UserName(firstName);
    this._lastName = new UserName(lastName);
    this._updatedAt = new Date();
  }

  updateEmail(newEmail: string): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar email de um usuário inativo');
    }
    this._email = new UserEmail(newEmail);
    this._emailVerifiedAt = undefined; // Reset verification
    this._updatedAt = new Date();
  }

  updatePreferences(newPreferences: UserPreferences): void {
    if (!this.isActive) {
      throw new Error('Não é possível atualizar preferências de um usuário inativo');
    }
    this._preferences = newPreferences;
    this._updatedAt = new Date();
  }

  verifyEmail(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível verificar email de um usuário deletado');
    }
    this._emailVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  recordLogin(): void {
    if (this._deletedAt) {
      throw new Error('Não é possível registrar login de um usuário deletado');
    }
    this._lastLoginAt = new Date();
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
      tenantId: this._tenantId.getValue(),
      email: this._email.getValue(),
      passwordHash: this._passwordHash.getValue(),
      firstName: this._firstName.getValue(),
      lastName: this._lastName.getValue(),
      role: this._role,
      status: this._status,
      preferences: this._preferences.toPersistence(),
      emailVerifiedAt: this._emailVerifiedAt,
      lastLoginAt: this._lastLoginAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt
    };
  }
}

// Value Object para preferências do usuário
export class UserPreferences extends ValueObject<object> {
  private constructor(
    public readonly notifications: boolean,
    public readonly theme: 'light' | 'dark' | 'auto',
    public readonly language: string,
    public readonly timezone?: string,
    public readonly customSettings?: Record<string, any>
  ) {
    super({
      notifications,
      theme,
      language,
      timezone,
      customSettings
    });
    this.validate();
  }

  static create(
    notifications: boolean,
    theme: 'light' | 'dark' | 'auto' = 'light',
    language: string = 'pt-BR',
    timezone?: string,
    customSettings?: Record<string, any>
  ): UserPreferences {
    return new UserPreferences(
      notifications,
      theme,
      language,
      timezone,
      customSettings
    );
  }

  static createDefault(): UserPreferences {
    return new UserPreferences(
      true,
      'light',
      'pt-BR',
      'America/Sao_Paulo'
    );
  }

  static fromPersistence(data: any): UserPreferences {
    return new UserPreferences(
      data.notifications ?? true,
      data.theme ?? 'light',
      data.language ?? 'pt-BR',
      data.timezone,
      data.customSettings
    );
  }

  private validate(): void {
    if (typeof this.notifications !== 'boolean') {
      throw new Error('Notifications deve ser um boolean');
    }
    if (!['light', 'dark', 'auto'].includes(this.theme)) {
      throw new Error('Theme deve ser light, dark ou auto');
    }
    if (!this.language || typeof this.language !== 'string') {
      throw new Error('Language é obrigatório');
    }
    if (this.timezone && typeof this.timezone !== 'string') {
      throw new Error('Timezone deve ser uma string válida');
    }
  }

  toPersistence(): any {
    return {
      notifications: this.notifications,
      theme: this.theme,
      language: this.language,
      timezone: this.timezone,
      customSettings: this.customSettings
    };
  }
}
