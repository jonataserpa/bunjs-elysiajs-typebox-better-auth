import type { 
  CreatePaymentDTO, 
  UpdatePaymentDTO, 
  AuthorizePaymentDTO,
  CapturePaymentDTO,
  FailPaymentDTO,
  CancelPaymentDTO,
  RefundPaymentDTO,
  ExtendPaymentExpirationDTO 
} from '../dtos/PaymentDTOs';
import { ValidationResult, ValidationResultBuilder } from './ValidationResult';

/**
 * Validador para operações relacionadas a Payments
 */
export class PaymentValidator {
  /**
   * Valida dados para criação de pagamento
   */
  static validateCreate(dto: CreatePaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Validar tenantId
    if (!dto.tenantId || typeof dto.tenantId !== 'string') {
      builder.addError('tenantId', 'Tenant ID é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.tenantId.length < 3) {
      builder.addError('tenantId', 'Tenant ID deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    // Validar userId se fornecido
    if (dto.userId !== undefined) {
      if (typeof dto.userId !== 'string') {
        builder.addError('userId', 'User ID deve ser uma string', 'INVALID_TYPE');
      } else if (dto.userId.length < 3) {
        builder.addError('userId', 'User ID deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
      }
    }

    // Validar amount
    if (typeof dto.amount !== 'number') {
      builder.addError('amount', 'Valor é obrigatório e deve ser um número', 'REQUIRED_FIELD');
    } else if (dto.amount <= 0) {
      builder.addError('amount', 'Valor deve ser maior que zero', 'MIN_VALUE');
    } else if (dto.amount > 1000000) { // R$ 10.000,00
      builder.addError('amount', 'Valor não pode ser maior que R$ 10.000,00', 'MAX_VALUE');
    }

    // Validar currency
    if (!dto.currency || typeof dto.currency !== 'string') {
      builder.addError('currency', 'Moeda é obrigatória', 'REQUIRED_FIELD');
    } else if (!['BRL', 'USD', 'EUR'].includes(dto.currency)) {
      builder.addError('currency', 'Moeda deve ser BRL, USD ou EUR', 'INVALID_CURRENCY');
    }

    // Validar provider
    if (!dto.provider || typeof dto.provider !== 'string') {
      builder.addError('provider', 'Provider é obrigatório', 'REQUIRED_FIELD');
    } else if (!['stripe', 'pagarme', 'mercadopago'].includes(dto.provider)) {
      builder.addError('provider', 'Provider deve ser stripe, pagarme ou mercadopago', 'INVALID_PROVIDER');
    }

    // Validar description
    if (!dto.description || typeof dto.description !== 'string') {
      builder.addError('description', 'Descrição é obrigatória', 'REQUIRED_FIELD');
    } else if (dto.description.trim().length < 3) {
      builder.addError('description', 'Descrição deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    } else if (dto.description.length > 255) {
      builder.addError('description', 'Descrição não pode ter mais de 255 caracteres', 'MAX_LENGTH');
    }

    // Validar metadata se fornecido
    if (dto.metadata !== undefined) {
      if (typeof dto.metadata !== 'object' || Array.isArray(dto.metadata)) {
        builder.addError('metadata', 'Metadata deve ser um objeto', 'INVALID_TYPE');
      }
    }

    // Validar expiresAt se fornecido
    if (dto.expiresAt !== undefined) {
      if (typeof dto.expiresAt !== 'string') {
        builder.addError('expiresAt', 'Data de expiração deve ser uma string ISO', 'INVALID_TYPE');
      } else {
        try {
          const expiresAt = new Date(dto.expiresAt);
          if (isNaN(expiresAt.getTime())) {
            builder.addError('expiresAt', 'Data de expiração inválida', 'INVALID_DATE');
          } else if (expiresAt <= new Date()) {
            builder.addError('expiresAt', 'Data de expiração deve ser no futuro', 'INVALID_DATE_RANGE');
          }
        } catch {
          builder.addError('expiresAt', 'Formato de data de expiração inválido', 'INVALID_DATE_FORMAT');
        }
      }
    }

    return builder.build();
  }

  /**
   * Valida dados para atualização de pagamento
   */
  static validateUpdate(dto: UpdatePaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Validar description se fornecida
    if (dto.description !== undefined) {
      if (typeof dto.description !== 'string') {
        builder.addError('description', 'Descrição deve ser uma string', 'INVALID_TYPE');
      } else if (dto.description.trim().length < 3) {
        builder.addError('description', 'Descrição deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
      } else if (dto.description.length > 255) {
        builder.addError('description', 'Descrição não pode ter mais de 255 caracteres', 'MAX_LENGTH');
      }
    }

    // Validar metadata se fornecido
    if (dto.metadata !== undefined) {
      if (typeof dto.metadata !== 'object' || Array.isArray(dto.metadata)) {
        builder.addError('metadata', 'Metadata deve ser um objeto', 'INVALID_TYPE');
      }
    }

    // Validar expiresAt se fornecido
    if (dto.expiresAt !== undefined) {
      if (typeof dto.expiresAt !== 'string') {
        builder.addError('expiresAt', 'Data de expiração deve ser uma string ISO', 'INVALID_TYPE');
      } else {
        try {
          const expiresAt = new Date(dto.expiresAt);
          if (isNaN(expiresAt.getTime())) {
            builder.addError('expiresAt', 'Data de expiração inválida', 'INVALID_DATE');
          } else if (expiresAt <= new Date()) {
            builder.addError('expiresAt', 'Data de expiração deve ser no futuro', 'INVALID_DATE_RANGE');
          }
        } catch {
          builder.addError('expiresAt', 'Formato de data de expiração inválido', 'INVALID_DATE_FORMAT');
        }
      }
    }

    return builder.build();
  }

  /**
   * Valida dados para autorização de pagamento
   */
  static validateAuthorize(dto: AuthorizePaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (!dto.authorizedBy || typeof dto.authorizedBy !== 'string') {
      builder.addError('authorizedBy', 'ID do usuário que está autorizando é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida dados para captura de pagamento
   */
  static validateCapture(dto: CapturePaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (!dto.capturedBy || typeof dto.capturedBy !== 'string') {
      builder.addError('capturedBy', 'ID do usuário que está capturando é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida dados para falha de pagamento
   */
  static validateFail(dto: FailPaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (!dto.failureReason || typeof dto.failureReason !== 'string') {
      builder.addError('failureReason', 'Motivo da falha é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.failureReason.trim().length < 3) {
      builder.addError('failureReason', 'Motivo da falha deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    if (!dto.failedBy || typeof dto.failedBy !== 'string') {
      builder.addError('failedBy', 'ID do usuário que está reportando a falha é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida dados para cancelamento de pagamento
   */
  static validateCancel(dto: CancelPaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (!dto.cancellationReason || typeof dto.cancellationReason !== 'string') {
      builder.addError('cancellationReason', 'Motivo do cancelamento é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.cancellationReason.trim().length < 3) {
      builder.addError('cancellationReason', 'Motivo do cancelamento deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    if (!dto.cancelledBy || typeof dto.cancelledBy !== 'string') {
      builder.addError('cancelledBy', 'ID do usuário que está cancelando é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida dados para reembolso de pagamento
   */
  static validateRefund(dto: RefundPaymentDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (dto.refundAmount !== undefined) {
      if (typeof dto.refundAmount !== 'number') {
        builder.addError('refundAmount', 'Valor do reembolso deve ser um número', 'INVALID_TYPE');
      } else if (dto.refundAmount <= 0) {
        builder.addError('refundAmount', 'Valor do reembolso deve ser maior que zero', 'MIN_VALUE');
      }
    }

    if (!dto.refundReason || typeof dto.refundReason !== 'string') {
      builder.addError('refundReason', 'Motivo do reembolso é obrigatório', 'REQUIRED_FIELD');
    } else if (dto.refundReason.trim().length < 3) {
      builder.addError('refundReason', 'Motivo do reembolso deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    if (!dto.refundedBy || typeof dto.refundedBy !== 'string') {
      builder.addError('refundedBy', 'ID do usuário que está reembolsando é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida dados para extensão de expiração
   */
  static validateExtendExpiration(dto: ExtendPaymentExpirationDTO): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!dto.paymentId || typeof dto.paymentId !== 'string') {
      builder.addError('paymentId', 'Payment ID é obrigatório', 'REQUIRED_FIELD');
    }

    if (!dto.newExpiresAt || typeof dto.newExpiresAt !== 'string') {
      builder.addError('newExpiresAt', 'Nova data de expiração é obrigatória', 'REQUIRED_FIELD');
    } else {
      try {
        const newExpiresAt = new Date(dto.newExpiresAt);
        if (isNaN(newExpiresAt.getTime())) {
          builder.addError('newExpiresAt', 'Nova data de expiração inválida', 'INVALID_DATE');
        } else if (newExpiresAt <= new Date()) {
          builder.addError('newExpiresAt', 'Nova data de expiração deve ser no futuro', 'INVALID_DATE_RANGE');
        }
      } catch {
        builder.addError('newExpiresAt', 'Formato de nova data de expiração inválido', 'INVALID_DATE_FORMAT');
      }
    }

    if (!dto.extendedBy || typeof dto.extendedBy !== 'string') {
      builder.addError('extendedBy', 'ID do usuário que está estendendo é obrigatório', 'REQUIRED_FIELD');
    }

    return builder.build();
  }

  /**
   * Valida ID do pagamento
   */
  static validateId(id: string): ValidationResult {
    const builder = new ValidationResultBuilder();

    if (!id || typeof id !== 'string') {
      builder.addError('id', 'ID do pagamento é obrigatório', 'REQUIRED_FIELD');
    } else if (id.length < 3) {
      builder.addError('id', 'ID do pagamento deve ter pelo menos 3 caracteres', 'MIN_LENGTH');
    }

    return builder.build();
  }
}
