import { DomainEvent } from './DomainEvent';

/**
 * Evento disparado quando um usuário é criado
 */
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: string,
    public readonly createdBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.created';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdBy: this.createdBy
    };
  }
}

/**
 * Evento disparado quando um usuário faz login
 */
export class UserLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly loginAt: Date,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.logged_in';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      loginAt: this.loginAt.toISOString(),
      ipAddress: this.ipAddress,
      userAgent: this.userAgent
    };
  }
}

/**
 * Evento disparado quando um usuário faz logout
 */
export class UserLoggedOutEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly logoutAt: Date,
    public readonly sessionDuration: number // em minutos
  ) {
    super();
  }

  get eventName(): string {
    return 'user.logged_out';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      logoutAt: this.logoutAt.toISOString(),
      sessionDuration: this.sessionDuration
    };
  }
}

/**
 * Evento disparado quando um usuário é ativado
 */
export class UserActivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly activatedBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.activated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      activatedBy: this.activatedBy
    };
  }
}

/**
 * Evento disparado quando um usuário é desativado
 */
export class UserDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.deactivated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      deactivatedBy: this.deactivatedBy,
      reason: this.reason
    };
  }
}

/**
 * Evento disparado quando um usuário é suspenso
 */
export class UserSuspendedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly suspendedBy: string,
    public readonly reason: string,
    public readonly suspendedUntil?: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'user.suspended';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      suspendedBy: this.suspendedBy,
      reason: this.reason,
      suspendedUntil: this.suspendedUntil?.toISOString()
    };
  }
}

/**
 * Evento disparado quando o role de um usuário é alterado
 */
export class UserRoleChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.role_changed';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      oldRole: this.oldRole,
      newRole: this.newRole,
      changedBy: this.changedBy
    };
  }
}

/**
 * Evento disparado quando um usuário atualiza sua senha
 */
export class UserPasswordUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly updatedBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.password_updated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      updatedBy: this.updatedBy
    };
  }
}

/**
 * Evento disparado quando um usuário atualiza seu email
 */
export class UserEmailUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
    public readonly updatedBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.email_updated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      oldEmail: this.oldEmail,
      newEmail: this.newEmail,
      updatedBy: this.updatedBy
    };
  }
}

/**
 * Evento disparado quando um usuário é deletado
 */
export class UserDeletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.deleted';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      email: this.email,
      deletedBy: this.deletedBy,
      reason: this.reason
    };
  }
}
