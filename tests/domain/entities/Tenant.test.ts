import { describe, test, expect, beforeEach } from 'bun:test';
import { Tenant, TenantId, TenantSlug, TenantEmail, TenantStatus, TenantSettings } from '../../../src/domain/entities/Tenant';

describe('Tenant Entity', () => {
  let tenant: Tenant;
  let tenantSettings: TenantSettings;

  beforeEach(() => {
    tenantSettings = TenantSettings.create(
      'America/Sao_Paulo',
      'BRL',
      'pt-BR',
      ['stripe', 'pagarme'],
      'https://example.com/webhook',
      { maxPaymentAmount: '100000' }
    );

    tenant = Tenant.create(
      'tenant-123',
      'TechCorp Solutions',
      'techcorp',
      'admin@techcorp.com',
      tenantSettings
    );
  });

  describe('Creation', () => {
    test('should create a new tenant with valid data', () => {
      expect(tenant.id.getValue()).toBe('tenant-123');
      expect(tenant.name).toBe('TechCorp Solutions');
      expect(tenant.slug.getValue()).toBe('techcorp');
      expect(tenant.email.getValue()).toBe('admin@techcorp.com');
      expect(tenant.status).toBe(TenantStatus.ACTIVE);
      expect(tenant.isActive).toBe(true);
    });

    test('should set created and updated dates', () => {
      expect(tenant.createdAt).toBeInstanceOf(Date);
      expect(tenant.updatedAt).toBeInstanceOf(Date);
      expect(tenant.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(tenant.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Value Objects', () => {
    test('should create TenantId with valid string', () => {
      const tenantId = new TenantId('valid-id');
      expect(tenantId.getValue()).toBe('valid-id');
    });

    test('should throw error for invalid TenantId', () => {
      expect(() => new TenantId('')).toThrow('TenantId deve ser uma string válida');
      expect(() => new TenantId('ab')).toThrow('TenantId deve ter pelo menos 3 caracteres');
    });

    test('should create TenantSlug with valid format', () => {
      const slug = new TenantSlug('valid-slug');
      expect(slug.getValue()).toBe('valid-slug');
    });

    test('should throw error for invalid TenantSlug', () => {
      expect(() => new TenantSlug('Invalid Slug!')).toThrow('TenantSlug deve conter apenas letras minúsculas, números e hífens');
      expect(() => new TenantSlug('ab')).toThrow('TenantSlug deve ter entre 3 e 50 caracteres');
    });

    test('should create TenantEmail with valid format', () => {
      const email = new TenantEmail('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    test('should throw error for invalid TenantEmail', () => {
      expect(() => new TenantEmail('invalid-email')).toThrow('TenantEmail deve ter um formato válido');
    });
  });

  describe('Business Logic', () => {
    test('should activate tenant', () => {
      tenant.deactivate();
      expect(tenant.status).toBe(TenantStatus.INACTIVE);
      
      tenant.activate();
      expect(tenant.status).toBe(TenantStatus.ACTIVE);
      expect(tenant.isActive).toBe(true);
    });

    test('should deactivate tenant', () => {
      tenant.deactivate();
      expect(tenant.status).toBe(TenantStatus.INACTIVE);
      expect(tenant.isActive).toBe(false);
    });

    test('should suspend tenant', () => {
      tenant.suspend();
      expect(tenant.status).toBe(TenantStatus.SUSPENDED);
      expect(tenant.isActive).toBe(false);
    });

    test('should not activate deleted tenant', () => {
      tenant.softDelete();
      expect(() => tenant.activate()).toThrow('Não é possível ativar um tenant deletado');
    });

    test('should not deactivate deleted tenant', () => {
      tenant.softDelete();
      expect(() => tenant.deactivate()).toThrow('Não é possível desativar um tenant deletado');
    });

    test('should not suspend deleted tenant', () => {
      tenant.softDelete();
      expect(() => tenant.suspend()).toThrow('Não é possível suspender um tenant deletado');
    });

    test('should update settings for active tenant', () => {
      const newSettings = TenantSettings.create(
        'America/New_York',
        'USD',
        'en-US',
        ['stripe'],
        'https://new-webhook.com'
      );

      tenant.updateSettings(newSettings);
      expect(tenant.settings.timezone).toBe('America/New_York');
      expect(tenant.settings.currency).toBe('USD');
    });

    test('should not update settings for inactive tenant', () => {
      tenant.deactivate();
      const newSettings = TenantSettings.create('America/New_York', 'USD', 'en-US', ['stripe']);
      
      expect(() => tenant.updateSettings(newSettings)).toThrow('Não é possível atualizar configurações de um tenant inativo');
    });

    test('should update basic info for active tenant', () => {
      tenant.updateBasicInfo('New Company Name', 'new@company.com');
      expect(tenant.name).toBe('New Company Name');
      expect(tenant.email.getValue()).toBe('new@company.com');
    });

    test('should not update basic info for inactive tenant', () => {
      tenant.deactivate();
      expect(() => tenant.updateBasicInfo('New Name', 'new@email.com')).toThrow('Não é possível atualizar informações de um tenant inativo');
    });

    test('should soft delete tenant', () => {
      tenant.softDelete();
      expect(tenant.deletedAt).toBeInstanceOf(Date);
      expect(tenant.isActive).toBe(false);
    });
  });

  describe('TenantSettings', () => {
    test('should create default settings', () => {
      const settings = TenantSettings.create(
        'America/Sao_Paulo',
        'BRL',
        'pt-BR',
        ['stripe', 'pagarme']
      );

      expect(settings.timezone).toBe('America/Sao_Paulo');
      expect(settings.currency).toBe('BRL');
      expect(settings.language).toBe('pt-BR');
      expect(settings.paymentMethods).toEqual(['stripe', 'pagarme']);
    });

    test('should validate required fields', () => {
      expect(() => TenantSettings.create('', 'BRL', 'pt-BR', [])).toThrow('Timezone é obrigatório');
      expect(() => TenantSettings.create('UTC', '', 'pt-BR', [])).toThrow('Moeda é obrigatória');
      expect(() => TenantSettings.create('UTC', 'BRL', '', [])).toThrow('Idioma é obrigatório');
    });

    test('should validate payment methods array', () => {
      expect(() => TenantSettings.create('UTC', 'BRL', 'pt-BR', 'invalid' as any)).toThrow('Métodos de pagamento devem ser um array');
    });

    test('should validate webhook URL format', () => {
      expect(() => TenantSettings.create('UTC', 'BRL', 'pt-BR', [], 'invalid-url')).toThrow('URL do webhook deve ter um formato válido');
    });

    test('should serialize to persistence format', () => {
      const settings = TenantSettings.create(
        'America/Sao_Paulo',
        'BRL',
        'pt-BR',
        ['stripe'],
        'https://webhook.com',
        { key: 'value' }
      );

      const persistence = settings.toPersistence();
      expect(persistence.timezone).toBe('America/Sao_Paulo');
      expect(persistence.currency).toBe('BRL');
      expect(persistence.language).toBe('pt-BR');
      expect(persistence.paymentMethods).toEqual(['stripe']);
      expect(persistence.webhookUrl).toBe('https://webhook.com');
      expect(persistence.apiKeys).toEqual({ key: 'value' });
    });
  });

  describe('Persistence', () => {
    test('should serialize to persistence format', () => {
      const persistence = tenant.toPersistence();
      
      expect(persistence.id).toBe('tenant-123');
      expect(persistence.name).toBe('TechCorp Solutions');
      expect(persistence.slug).toBe('techcorp');
      expect(persistence.email).toBe('admin@techcorp.com');
      expect(persistence.status).toBe(TenantStatus.ACTIVE);
      expect(persistence.settings).toBeDefined();
      expect(persistence.createdAt).toBeInstanceOf(Date);
      expect(persistence.updatedAt).toBeInstanceOf(Date);
    });

    test('should create from persistence data', () => {
      const persistence = tenant.toPersistence();
      const recreated = Tenant.fromPersistence(
        persistence.id,
        persistence.name,
        persistence.slug,
        persistence.email,
        persistence.status,
        persistence.settings,
        persistence.createdAt,
        persistence.updatedAt,
        persistence.deletedAt
      );

      expect(recreated.id.getValue()).toBe(tenant.id.getValue());
      expect(recreated.name).toBe(tenant.name);
      expect(recreated.slug.getValue()).toBe(tenant.slug.getValue());
      expect(recreated.email.getValue()).toBe(tenant.email.getValue());
      expect(recreated.status).toBe(tenant.status);
    });
  });
});
