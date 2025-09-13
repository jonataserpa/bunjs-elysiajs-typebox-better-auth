import type { CreateTenantDTO, UpdateTenantDTO } from '../dtos/TenantDTOs';
import { ValidationResult, ValidationResultBuilder } from './ValidationResult';

/**
 * Validador para operações relacionadas a Tenants
 */
export class TenantValidator {
  /**
   * Valida dados para criação de tenant
   */
  static validateCreate(dto: CreateTenantDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Validar nome
    if (!dto.name || typeof dto.name !== 'string') {
      builder.addError('name', 'Nome é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.name.trim().length < 3) {
      builder.addError('name', 'Nome deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    } else if (dto.name.length > 255) {
      builder.addError('name', 'Nome não pode ter mais de 255 caracteres', 'MAX_LENGTH');
    }

    // Validar slug
    if (!dto.slug || typeof dto.slug !== 'string') {
      builder.addError('slug', 'Slug é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.slug.trim().length < 3) {
      builder.addError('slug', 'Slug deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    } else if (dto.slug.length > 50) {
      builder.addError('slug', 'Slug não pode ter mais de 50 caracteres', 'MAX_LENGTH');
    } else if (!/^[a-z0-9-]+$/.test(dto.slug)) {
      builder.addError('slug', 'Slug deve conter apenas letras minúsculas, números e hífens', 'INVALID_FORMAT');
    }

    // Validar email
    if (!dto.email || typeof dto.email !== 'string') {
      builder.addError('email', 'Email é obrigatório', 'REQUIRED_FIELD');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      builder.addError('email', 'Email deve ter um formato válido', 'INVALID_FORMAT');
    } else if (dto.email.length > 255) {
      builder.addError('email', 'Email não pode ter mais de 255 caracteres', 'MAX_LENGTH');
    }

    // Validar configurações se fornecidas
    if (dto.settings) {
      const settingsValidation = this.validateSettings(dto.settings);
      if (!settingsValidation.isValid) {
        builder.addErrors(settingsValidation.errors);
      }
    }

    return builder.build();
  }

  /**
   * Valida dados para atualização de tenant
   */
  static validateUpdate(dto: UpdateTenantDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Validar nome se fornecido
    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string') {
        builder.addError('name', 'Nome deve ser uma string', 'INVALID_TYPE');
      } else if (dto.name.trim().length < 3) {
        builder.addError('name', 'Nome deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
      } else if (dto.name.length > 255) {
        builder.addError('name', 'Nome não pode ter mais de 255 caracteres', 'MAX_LENGTH');
      }
    }

    // Validar email se fornecido
    if (dto.email !== undefined) {
      if (typeof dto.email !== 'string') {
        builder.addError('email', 'Email deve ser uma string', 'INVALID_TYPE');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
        builder.addError('email', 'Email deve ter um formato válido', 'INVALID_FORMAT');
      } else if (dto.email.length > 255) {
        builder.addError('email', 'Email não pode ter mais de 255 caracteres', 'MAX_LENGTH');
      }
    }

    // Validar configurações se fornecidas
    if (dto.settings) {
      const settingsValidation = this.validateSettings(dto.settings);
      if (!settingsValidation.isValid) {
        builder.addErrors(settingsValidation.errors);
      }
    }

    return builder.build();
  }

  /**
   * Valida configurações do tenant
   */
  static validateSettings(settings: any): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Validar timezone se fornecido
    if (settings.timezone !== undefined) {
      if (typeof settings.timezone !== 'string') {
        builder.addError('settings.timezone', 'Timezone deve ser uma string', 'INVALID_TYPE');
      } else {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: settings.timezone });
        } catch {
          builder.addError('settings.timezone', 'Timezone inválido', 'INVALID_TIMEZONE');
        }
      }
    }

    // Validar currency se fornecido
    if (settings.currency !== undefined) {
      if (typeof settings.currency !== 'string') {
        builder.addError('settings.currency', 'Currency deve ser uma string', 'INVALID_TYPE');
      } else if (!['BRL', 'USD', 'EUR'].includes(settings.currency)) {
        builder.addError('settings.currency', 'Currency deve ser BRL, USD ou EUR', 'INVALID_CURRENCY');
      }
    }

    // Validar language se fornecido
    if (settings.language !== undefined) {
      if (typeof settings.language !== 'string') {
        builder.addError('settings.language', 'Language deve ser uma string', 'INVALID_TYPE');
      } else if (!['pt-BR', 'en-US', 'es-ES'].includes(settings.language)) {
        builder.addError('settings.language', 'Language deve ser pt-BR, en-US ou es-ES', 'INVALID_LANGUAGE');
      }
    }

    // Validar paymentMethods se fornecido
    if (settings.paymentMethods !== undefined) {
      if (!Array.isArray(settings.paymentMethods)) {
        builder.addError('settings.paymentMethods', 'Payment methods deve ser um array', 'INVALID_TYPE');
      } else {
        const validMethods = ['stripe', 'pagarme', 'mercadopago'];
        for (const method of settings.paymentMethods) {
          if (!validMethods.includes(method)) {
            builder.addError('settings.paymentMethods', `Método de pagamento inválido: ${method}`, 'INVALID_PAYMENT_METHOD');
          }
        }
      }
    }

    // Validar webhookUrl se fornecido
    if (settings.webhookUrl !== undefined) {
      if (typeof settings.webhookUrl !== 'string') {
        builder.addError('settings.webhookUrl', 'Webhook URL deve ser uma string', 'INVALID_TYPE');
      } else {
        try {
          new URL(settings.webhookUrl);
        } catch {
          builder.addError('settings.webhookUrl', 'URL do webhook inválida', 'INVALID_URL');
        }
      }
    }

    // Validar apiKeys se fornecido
    if (settings.apiKeys !== undefined) {
      if (typeof settings.apiKeys !== 'object' || Array.isArray(settings.apiKeys)) {
        builder.addError('settings.apiKeys', 'API Keys deve ser um objeto', 'INVALID_TYPE');
      }
    }

    return builder.build();
  }

  /**
   * Valida ID do tenant
   */
  static validateId(id: string): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!id || typeof id !== 'string') {
      builder.addError('id', 'ID do tenant é obrigatório', 'REQUIRED_FIELD');
    } else if (id.length < 3) {
      builder.addError('id', 'ID do tenant deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    return builder.build();
  }

  /**
   * Valida dados para ativação/desativação
   */
  static validateStatusChange(tenantId: string, changedBy: string): ValidationResult {
    const builder = new ValidationResultBuilder();

    const idValidation = this.validateId(tenantId);
    if (!idValidation.isValid) {
      builder.addErrors(idValidation.errors);
    }

    if (!changedBy || typeof changedBy !== 'string') {
      builder.addError('changedBy', 'ID do usuário que está fazendo a alteração é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }
}
