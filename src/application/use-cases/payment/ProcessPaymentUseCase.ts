// Imports removidos - não utilizados
import { PaymentDomainService } from '../../../domain/services/PaymentDomainService';
import type { 
  AuthorizePaymentDTO, 
  CapturePaymentDTO, 
  FailPaymentDTO, 
  CancelPaymentDTO, 
  RefundPaymentDTO,
  PaymentResponseDTO 
} from '../../dtos/PaymentDTOs';
import { PaymentMapper } from '../../mappers/PaymentMapper';
import { PaymentValidator } from '../../validators/PaymentValidator';
import type { TenantRepository } from '../../../application/interfaces/repositories/TenantRepository';
import type { PaymentRepository } from '../../../application/interfaces/repositories/PaymentRepository';
import { ValidationResult } from '../../validators/ValidationResult';

/**
 * Use Case para processamento de pagamentos
 */
export class ProcessPaymentUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Executa a autorização de um pagamento
   */
  async authorizePayment(dto: AuthorizePaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateAuthorize(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 3. Verificar se pode ser autorizado
      if (!payment.isPending) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não está pendente', 'INVALID_STATUS');
        return { success: false, errors: validationResult };
      }

      // 4. Autorizar pagamento
      payment.authorize();

      // 5. Salvar alterações
      await this.paymentRepository.save(payment);

      // 6. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao autorizar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa a captura de um pagamento
   */
  async capturePayment(dto: CapturePaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateCapture(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 3. Verificar se pode ser capturado
      if (!payment.canBeCaptured) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não pode ser capturado', 'INVALID_STATUS');
        return { success: false, errors: validationResult };
      }

      // 4. Capturar pagamento
      payment.capture();

      // 5. Salvar alterações
      await this.paymentRepository.save(payment);

      // 6. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao capturar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa a falha de um pagamento
   */
  async failPayment(dto: FailPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateFail(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 3. Falhar pagamento
      payment.fail(dto.failureReason);

      // 4. Salvar alterações
      await this.paymentRepository.save(payment);

      // 5. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao falhar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa o cancelamento de um pagamento
   */
  async cancelPayment(dto: CancelPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateCancel(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 3. Verificar se pode ser cancelado
      if (!payment.canBeCancelled) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não pode ser cancelado', 'INVALID_STATUS');
        return { success: false, errors: validationResult };
      }

      // 4. Cancelar pagamento
      payment.cancel(dto.cancellationReason);

      // 5. Salvar alterações
      await this.paymentRepository.save(payment);

      // 6. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa o reembolso de um pagamento
   */
  async refundPayment(dto: RefundPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateRefund(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 3. Buscar tenant para validações
      const tenant = await this.tenantRepository.findById(payment.tenantId.getValue());
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // 4. Validar se pode ser reembolsado
      const canRefund = PaymentDomainService.canProcessRefund(payment, dto.refundAmount);
      if (!canRefund.canRefund) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canRefund.reason || 'Não é possível reembolsar o pagamento', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // 5. Reembolsar pagamento
      payment.refund(dto.refundAmount, dto.refundReason);

      // 6. Salvar alterações
      await this.paymentRepository.save(payment);

      // 7. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }
}
