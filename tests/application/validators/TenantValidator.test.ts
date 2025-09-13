import { describe, test, expect } from 'bun:test';
import { TenantValidator } from '../../../src/application/validators/TenantValidator';
import type { CreateTenantDTO, UpdateTenantDTO } from '../../../src/application/dtos/TenantDTOs';

describe('TenantValidator', () => {
  describe('validateCreate', () => {
    test('should validate valid tenant creation data', () => {
      const dto: CreateTenantDTO = {
        name: 'TechCorp Solutions',
        slug: 'techcorp',
        email: 'admin@techcorp.com',
        settings: {
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR',
          paymentMethods: ['stripe', 'pagarme']
        }
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for missing name', () => {
      const dto: CreateTenantDTO = {
        name: '',
        slug: 'techcorp',
        email: 'admin@techcorp.com'
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].message).toBe('Nome é obrigatório');
    });

    test('should fail validation for short name', () => {
      const dto: CreateTenantDTO = {
        name: 'AB',
        slug: 'techcorp',
        email: 'admin@techcorp.com'
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].message).toBe('Nome deve ter pelo menos 3 caracteres');
    });

    test('should fail validation for invalid slug', () => {
      const dto: CreateTenantDTO = {
        name: 'TechCorp Solutions',
        slug: 'Invalid Slug!',
        email: 'admin@techcorp.com'
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('slug');
      expect(result.errors[0].message).toBe('Slug deve conter apenas letras minúsculas, números e hífens');
    });

    test('should fail validation for invalid email', () => {
      const dto: CreateTenantDTO = {
        name: 'TechCorp Solutions',
        slug: 'techcorp',
        email: 'invalid-email'
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toBe('Email deve ter um formato válido');
    });

    test('should fail validation for invalid settings', () => {
      const dto: CreateTenantDTO = {
        name: 'TechCorp Solutions',
        slug: 'techcorp',
        email: 'admin@techcorp.com',
        settings: {
          timezone: 'Invalid/Timezone',
          currency: 'INVALID',
          language: 'invalid',
          paymentMethods: ['invalid_method']
        }
      };

      const result = TenantValidator.validateCreate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const errorFields = result.errors.map(e => e.field);
      expect(errorFields).toContain('settings.timezone');
      expect(errorFields).toContain('settings.currency');
      expect(errorFields).toContain('settings.language');
      expect(errorFields).toContain('settings.paymentMethods');
    });
  });

  describe('validateUpdate', () => {
    test('should validate valid update data', () => {
      const dto: UpdateTenantDTO = {
        name: 'Updated Company Name',
        email: 'new@company.com'
      };

      const result = TenantValidator.validateUpdate(dto);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate partial update', () => {
      const dto: UpdateTenantDTO = {
        name: 'Updated Company Name'
      };

      const result = TenantValidator.validateUpdate(dto);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for invalid email in update', () => {
      const dto: UpdateTenantDTO = {
        email: 'invalid-email'
      };

      const result = TenantValidator.validateUpdate(dto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toBe('Email deve ter um formato válido');
    });
  });

  describe('validateSettings', () => {
    test('should validate valid settings', () => {
      const settings = {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        paymentMethods: ['stripe', 'pagarme'],
        webhookUrl: 'https://example.com/webhook'
      };

      const result = TenantValidator.validateSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for invalid timezone', () => {
      const settings = {
        timezone: 'Invalid/Timezone'
      };

      const result = TenantValidator.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('settings.timezone');
      expect(result.errors[0].message).toBe('Timezone inválido');
    });

    test('should fail validation for invalid currency', () => {
      const settings = {
        currency: 'INVALID'
      };

      const result = TenantValidator.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('settings.currency');
      expect(result.errors[0].message).toBe('Currency deve ser BRL, USD ou EUR');
    });

    test('should fail validation for invalid webhook URL', () => {
      const settings = {
        webhookUrl: 'invalid-url'
      };

      const result = TenantValidator.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('settings.webhookUrl');
      expect(result.errors[0].message).toBe('URL do webhook inválida');
    });
  });

  describe('validateId', () => {
    test('should validate valid ID', () => {
      const result = TenantValidator.validateId('tenant-123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for empty ID', () => {
      const result = TenantValidator.validateId('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[0].message).toBe('ID do tenant é obrigatório');
    });

    test('should fail validation for short ID', () => {
      const result = TenantValidator.validateId('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[0].message).toBe('ID do tenant deve ter pelo menos 3 caracteres');
    });
  });

  describe('validateStatusChange', () => {
    test('should validate valid status change', () => {
      const result = TenantValidator.validateStatusChange('tenant-123', 'user-456');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for missing tenant ID', () => {
      const result = TenantValidator.validateStatusChange('', 'user-456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
    });

    test('should fail validation for missing changedBy', () => {
      const result = TenantValidator.validateStatusChange('tenant-123', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('changedBy');
      expect(result.errors[0].message).toBe('ID do usuário que está fazendo a alteração é obrigatório');
    });
  });
});
