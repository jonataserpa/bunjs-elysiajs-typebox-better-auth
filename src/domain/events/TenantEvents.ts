import { DomainEvent } from './DomainEvent';

/**
 * Evento disparado quando um tenant é criado
 */
export class TenantCreatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly email: string,
    public readonly createdBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.created';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      email: this.email,
      createdBy: this.createdBy
    };
  }
}

/**
 * Evento disparado quando um tenant é ativado
 */
export class TenantActivatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly activatedBy: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.activated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      activatedBy: this.activatedBy
    };
  }
}

/**
 * Evento disparado quando um tenant é desativado
 */
export class TenantDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.deactivated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      deactivatedBy: this.deactivatedBy,
      reason: this.reason
    };
  }
}

/**
 * Evento disparado quando um tenant é suspenso
 */
export class TenantSuspendedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly suspendedBy: string,
    public readonly reason: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.suspended';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      suspendedBy: this.suspendedBy,
      reason: this.reason
    };
  }
}

/**
 * Evento disparado quando um tenant é deletado
 */
export class TenantDeletedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.deleted';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      deletedBy: this.deletedBy,
      reason: this.reason
    };
  }
}

/**
 * Evento disparado quando as configurações de um tenant são atualizadas
 */
export class TenantSettingsUpdatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly updatedBy: string,
    public readonly settings: Record<string, any>,
    public readonly previousSettings: Record<string, any>
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.settings_updated';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      updatedBy: this.updatedBy,
      settings: this.settings,
      previousSettings: this.previousSettings
    };
  }
}

/**
 * Evento disparado quando um tenant atinge um limite
 */
export class TenantLimitReachedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly limitType: string,
    public readonly currentValue: number,
    public readonly limitValue: number
  ) {
    super();
  }

  get eventName(): string {
    return 'tenant.limit_reached';
  }

  get eventVersion(): number {
    return 1;
  }

  get eventData(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      limitType: this.limitType,
      currentValue: this.currentValue,
      limitValue: this.limitValue
    };
  }
}
